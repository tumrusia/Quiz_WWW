import * as sqlite3 from 'sqlite3';

sqlite3.verbose();
let db = new sqlite3.Database('quiz.db');

function addQuizToDB(name: string, id: number) {
    let date: string = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.run('INSERT INTO meme (url, price, date, actual) VALUES ("' + filename + '", ' + price + ', "' + date + '", 1);');
}

let jsonDaneQuizu: string = `{
    "pytania": [
        "Ile to 2-3?",
        "Ile to 1+1?",
        "Ile to 5*0?",
        "Ile to 36:9?"
    ],
    "odp1": [
        "1",
        "11",
        "0",
        "5"
    ],
    "odp2": [
        "2",
        "2",
        "-5",
        "4"
    ],
    "odp3": [
        "-1",
        "1",
        "5",
        "3"
    ],
    "odpPoprawnaId": [
        2,
        1,
        0,
        1
    ]
}`;

function initDB() {
    addQuizToDB('1.jpg', 20);
    addQuizToDB('2.jpg', 21);
    addQuizToDB('3.jpg', 22);
    addQuizToDB('4.jpg', 23);
    addQuizToDB('5.jpg', 24);
    addQuizToDB('6.jpg', 25);
    addQuizToDB('7.jpg', 26);
    addQuizToDB('8.jpg', 27);
    addQuizToDB('9.jpg', 28);
    addQuizToDB('10.jpg', 29);

    db.run('INSERT INTO session (nick, pages, expire, actual) VALUES ("", 0, "", 1);');
}

initDB();