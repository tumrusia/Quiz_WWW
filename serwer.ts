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

const changePassword = (login, password) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users SET password = "' + password + '" WHERE login = "' + login + '";');
        resolve();
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

const getQuizContent = (id) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT content FROM quizzes WHERE id = ' + id + ';';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            if (rows.length !== 1) {
                reject("ID quizu nie jest unikatowe");
            } else {
                resolve(rows[0].content);
            }
        });
    });
}

const checkIsSolved = (quizID, login) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT times, answers FROM solutions WHERE login = "' + login + '" AND quizID = ' + quizID + ';';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            if (rows.length > 1) {
                reject("Wystąpił błąd, w efekcie którego, użytkownik rozwiązywał dwukrotnie ten sam quiz.");
            } else if (rows.length === 1) {
                let o = [rows[0].times, rows[0].answers];
                resolve(o);
            } else {
                let o = ["", ""];
                resolve(o);
            }
        });
    });
}

const addAnswersToDB = (times, answers, quizID, login) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'INSERT INTO solutions (login, quizID, times, answers) VALUES ("' + login + '", ' + quizID + ', "' + times + '", "' + answers + '");';
        db.run(zapytanie);
    });
}

const summarizeAnswers = (contentString, answers) => {
    return new Promise((resolve, reject) => {
        let help = contentString;
        while (contentString !== contentString.replace("''", "\"")) {
            contentString = contentString.replace("''", "\"");
        }
        let content = JSON.parse(contentString);
        let stats = [];
        for (let i = 0; i < 4; i++) {
            let correctAnswer = content.odp1[i];
            if (content.odpPoprawnaId[i].toString() === (1).toString()) {
                correctAnswer = content.odp2[i];
            } else if (content.odpPoprawnaId[i].toString() === (2).toString()) {
                correctAnswer = content.odp3[i];
            }
            let userAnswer = content.odp1[i];
            if (answers[i].toString() === (1).toString()) {
                userAnswer = content.odp2[i];
            } else if (answers[i].toString() === (2).toString()) {
                userAnswer = content.odp3[i];
            }
            let correctness = "DOBRZE";
            if (correctAnswer !== userAnswer) {
                correctness = "ŹLE";
            }
            let o = {nr: i+1, question: content.pytania[i], correctAnswer: correctAnswer, userAnswer: userAnswer, correctness: correctness};
            stats.push(o);
        }
        resolve(stats);
    });
}

const createRanking = (quizID) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT login, times FROM solutions WHERE quizID = ' + quizID + ';';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            let players = [];
            for (let {login, times} of rows) {
                let mm = 0;
                let ss = 0;
                times = JSON.parse(times);
                for (let i = 0; i < 4; i++) {
                    mm += times[i][0];
                    ss += times[i][1];
                }
                if (ss >= 60) {
                    let helpSS = ss % 60;
                    ss -= helpSS;
                    mm += ss / 60;
                    ss = helpSS;
                }
                let o = {login: login, mm: mm, ss: ss};
                players.push(o);
            }
            players.sort(function compare(a, b) {
                if (a.mm > b.mm) {
                    return 1;
                } else if (a.mm < b.mm) {
                    return -1;
                } else if (a.ss > b.ss) {
                    return 1;
                } else {
                    return -1;
                }
            });
            let ranking = [];
            for (let i = 0; i < 3 && i < rows.length; i++) {
                let time: string = players[i].mm.toString() + "m " + players[i].ss.toString() + "s";
                let o = {place: i+1, name: players[i].login, time: time};
                ranking.push(o);
            }
            resolve(ranking);
        });
    });
}

const calculateAverageTime = (quizID) => {
    return new Promise((resolve, reject) => {
        let zapytanie = 'SELECT times FROM solutions WHERE quizID = ' + quizID + ';';
        db.all(zapytanie, [], (err, rows) => {
            if (err) throw (err);

            let timeSum = [0,0,0,0];
            let counter = 0;
            for (let {times} of rows) {
                times = JSON.parse(times);
                for (let i = 0; i < 4; i++) {
                    timeSum[i] += times[i][0] * 60;
                    timeSum[i] += times[i][1];
                }
                counter++;
            }
            let averageTimes = [];
            for (let i = 0; i < 4; i++) {
                timeSum[i] = timeSum[i] / counter;
                let helpSS = timeSum[i] % 60;
                let ss = timeSum[i] - helpSS;
                let mm = ss / 60;
                ss = helpSS;
                let time: string = mm.toString() + "m " + ss.toString() + "s";
                let o = {question: i+1, time: time};
                averageTimes.push(o);
            }
            resolve(averageTimes);
        });
    });
}

app.get('/', function (req, res) {
    req.session.login = "";
    res.render('start', {});
});

app.post('/', function (req, res) {
    const create = (req.body.create === "yes");
    doesAccountExist(req.body.login)
        .then( (exist) => {
            if (create && exist) {
                res.render('register', {token: req.csrfToken(), errorMsg: "już istnieje użytkownik o takim loginie"});
            } else if (create) {
                createAccount(req.body.login, req.body.password)
                    .then( () => {
                        req.session.login = req.body.login;
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
                checkPassword(req.body.login, req.body.password)
                    .then( (correct) => {
                        if (correct) {
                            req.session.login = req.body.login;
                            selectQuizzes()
                                .then( (quizzes) => {
                                    res.render('quizzes', {quizzes: quizzes});
                                })
                                .catch((error) => {
                                    console.log(error.message);
                                });

                        } else {
                            res.render('login', {token: req.csrfToken(), errorMsg: "niepoprawne hasło"});
                        }
                    })
                    .catch((error) => {
                        console.log(error.message);
                    });
            } else {
                //chcę się zalogować, ale taki login nie istnieje
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

app.get('/changePassword', function (req, res) {
    res.render('password', {token: req.csrfToken(), errorMsg: ""});
});

app.post('/home', function (req, res) {
    doesAccountExist(req.body.login)
        .then( (exist) => {
            if (exist) {
                checkPassword(req.body.login, req.body.password)
                    .then( (correct) => {
                        if (correct) {
                            if (req.body.newPassword !== req.body.newPasswordRepeat) {
                                res.render('password', {token: req.csrfToken(), errorMsg: "Nowe hasła są różne"});
                            } else {
                                changePassword(req.body.login, req.body.newPassword)
                                    .then (() => {
                                        req.session.login = "";
                                        res.render('start', {});
                                    })
                                    .catch((error) => {
                                        console.log(error.message);
                                    })
                            }
                        } else {
                            res.render('password', {token: req.csrfToken(), errorMsg: "Niepoprawne hasło"});
                        }
                    })
                    .catch((error) => {
                        console.log(error.message);
                    });
            } else {
                res.render('password', {token: req.csrfToken(), errorMsg: "Konto o takim loginie nie istnieje"});
            }
        })
        .catch((error) => {
            console.log(error.message);
        });
});

app.get('/assets/:image', function (req, res) {
    openImage(req, res,'./assets/' + req.params.image);
});

app.get('/assets/icons/:image', function (req, res) {
    openImage(req, res,'./assets/icons/' + req.params.image);
});

app.get('/quizzes/:quizID', function (req, res) {
    let quizName;
    getQuizName(req.params.quizID)
        .then((name) => {
            quizName = name;
            return checkIsSolved(req.params.quizID, req.session.login);
        })
        .then((solution) => {
            if (solution[0] === "" && solution[1] === "") {
                // czyli użytkownik jeszcze nie rozwiązywał tego quizu
                res.render('quiz', {id: req.params.quizID, name: quizName});
            } else {
                // czyli użytkownik już rozwiązał ten quiz
                let times = JSON.parse(solution[0]);
                let answers = JSON.parse(solution[1]);
                let stats;
                let ranking;
                getQuizContent(req.params.quizID)
                    .then((contentString: string) => {
                        return summarizeAnswers(contentString, answers);
                    })
                    .then((statsResult) => {
                        stats = statsResult;
                        return createRanking(req.params.quizID);
                    })
                    .then((rankingResult) => {
                        ranking = rankingResult;
                        return calculateAverageTime(req.params.quizID);
                    })
                    .then((averageTimes) => {
                        res.render('stats', {name: quizName, stats: stats, winners: ranking, averageTimes: averageTimes});
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        })
        .catch((error) => {
            console.log(error);
        });
});

app.get('/quizzes', function (req, res) {
    selectQuizzes()
        .then( (quizzes) => {
            res.render('quizzes', {quizzes: quizzes});
        })
        .catch((error) => {
            console.log(error.message);
        });
});

app.post('/quizzes', function (req, res) {
    selectQuizzes()
        .then( (quizzes) => {
            res.render('quizzes', {quizzes: quizzes});
            addAnswersToDB(req.body.times, req.body.answers, req.body.quizID, req.session.login)
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
});

app.get('/play/:quizID', function (req, res) {
    let quizName;
    getQuizName(req.params.quizID)
        .then((name) => {
            quizName = name;
            return getQuizContent(req.params.quizID);
        })
        .then((content) => {
            res.render('play', {id: req.params.quizID, name: quizName, content: content, token: req.csrfToken()});
        })
        .catch((error) => {
            console.log(error);
        });
});


const PORT = 3000;
app.listen(PORT, function () {
    console.log(`Listening on http://localhost:${PORT}`);
});
