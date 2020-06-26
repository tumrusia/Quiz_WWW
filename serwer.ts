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

app.get('/', function (req, res) {
    res.render('index', {
        title: 'meme market',
        message: 'I\'m not good in memes, so I used random pictures, sorry',
        memes: selected,
        token: req.csrfToken(),
    });
});

app.post('/', function (req, res) {
    console.log(`Message received: ${req.body.nick}`);
    console.log(`CSRF token used: ${req.body._csrf}`);

    countPageViews()
        .then( () => {
            return getUserNick();
        })
        .then( (currentNick) => {
            return logInUser(req.body.nick, currentNick);
        })
        .then( () => {
            return chooseTheMostExpensive3();
        })
        .then( (selected) => {
            return openPageMain(req, res, selected);
        })
        .catch((error) => {
            console.log(error.message);
        });
});