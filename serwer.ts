import * as fs from 'fs';
import {promisify} from 'util';
import * as sqlite3 from 'sqlite3';

let open = promisify(fs.open);
let close = promisify(fs.close);
sqlite3.verbose();
let db = new sqlite3.Database('quiz.db');

const express = require('express');
const bodyParser = require('body-parser');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const csrfMiddleware = csurf({
    cookie: true
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(session({secret: "Shh, its a secret!"}));

app.set('view engine', 'pug');

function openImage(req, res, path: string) {
    let fd;
    let filename = req.params.image;
    open(path, 'a').then((_fd) => {
        fd = _fd;
        fs.readFile(path, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.write(err);
                res.end();
            } else {
                res.write(data);
                res.end();
            }
        });
    }).then(() => close(fd)).catch((reason) => {
        console.log('ERROR: ', reason);
    });
}

const createAccount = (login, password) => {
    return new Promise((resolve, reject) => {
        console.log("dodaj do bazy " + login + " " + password);
        db.run('INSERT INTO users (login, password) VALUES ("' + login + '", "' + password + '");');
        resolve();
    });
}

const doesAccountExist = (login) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT login FROM users WHERE login = "' + login + '";';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            if (rows.length === 0) {
                resolve(0);
            } else {
                console.log(rows[0].login + " " + rows[0].password);
                resolve(1);
            }
        });
    });
}

const checkPassword = (login, password) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT login, password FROM users WHERE login = "' + login + '";';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            if (rows[0].password === password) {
                resolve(1);
            } else {
                resolve(0);
            }
        });
    });
}

const selectQuizzes = () => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT id, name FROM quizzes;';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            let quizzes = [];
            for (let {id, name} of rows) {
                let o = {id: id, name: name};
                quizzes.push(o);
            }
            resolve(quizzes);
        });
    });
}

const getQuizName = (id) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT name FROM quizzes WHERE id = ' + id + ';';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            if (rows.length !== 1) {
                reject("ID quizu nie jest unikatowe");
            } else {
                resolve(rows[0].name);
            }
        });
    });
}

app.get('/', function (req, res) {
    res.render('start', {});
});

app.get('/quizzes', function (req, res) {
    res.render('start', {});
});

app.post('/quizzes', function (req, res) {
    console.log(`Login: ${req.body.login}`);

    const create = (req.body.create === "yes");

    doesAccountExist(req.body.login)
        .then( (exist) => {
            if (create && exist) {
                //chcę stworzyć konto, ale taki login już istnieje
                console.log("taki login już istnieje, wymyśl inny");
                res.render('register', {token: req.csrfToken(), errorMsg: "już istnieje użytkownik o takim loginie"});
            } else if (create) {
                //chcę stworzyć konto i taki login jeszcze nie istnieje
                console.log("stwórz konto");
                createAccount(req.body.login, req.body.password)
                    .then( () => {
                        req.session.login = req.body.login;
                        console.log("zarejestruj");
                        selectQuizzes()
                            .then( (quizzes) => {
                                res.render('quizzes', {quizzes: quizzes});
                            })
                            .catch((error) => {
                                console.log(error.message);
                            });
                    })
                    .catch((error) => {
                        console.log(error.message);
                    });
            } else if (exist) {
                //chcę się zalogować i taki login już istnieje
                checkPassword(req.body.login, req.body.password)
                    .then( (correct) => {
                        if (correct) {
                            req.session.login = req.body.login;
                            console.log("zaloguj");
                            selectQuizzes()
                                .then( (quizzes) => {
                                    res.render('quizzes', {quizzes: quizzes});
                                })
                                .catch((error) => {
                                    console.log(error.message);
                                });

                        } else {
                            console.log("niepoprawne hasło");
                            res.render('login', {token: req.csrfToken(), errorMsg: "niepoprawne hasło"});
                        }
                    })
                    .catch((error) => {
                        console.log(error.message);
                    });
            } else {
                //chcę się zalogować, ale taki login nie istnieje
                console.log("niepoprawny login");
                res.render('login', {token: req.csrfToken(), errorMsg: "użytkownik o takim loginie nie istnieje"});
            }
        })
        .catch((error) => {
            console.log(error.message);
        });
});

app.get('/login', function (req, res) {
    res.render('login', {token: req.csrfToken(), errorMsg: ""});
});

app.get('/register', function (req, res) {
    res.render('register', {token: req.csrfToken(), errorMsg: ""});
});

app.get('/assets/:image', function (req, res) {
    openImage(req, res,'./assets/' + req.params.image);
});

app.get('/assets/icons/:image', function (req, res) {
    openImage(req, res,'./assets/icons/' + req.params.image);
});

app.get('/quizzes/:quizID', function (req, res) {
    getQuizName(req.params.quizID)
        .then((name) => {
            res.render('quiz', {id: req.params.quizID, name: name});
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/play/:quizID', function (req, res) {
    getQuizName(req.params.quizID)
        .then((name) => {
            res.render('play', {id: req.params.quizID, name: name});
        })
        .catch((error) => {
            console.log(error);
        });
});


const PORT = 3000;
app.listen(PORT, function () {
    console.log(`Listening on http://localhost:${PORT}`);
});
