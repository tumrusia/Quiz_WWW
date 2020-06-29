import * as sqlite3 from 'sqlite3';

sqlite3.verbose();
let db = new sqlite3.Database('quiz.db');

function addQuizToDB(quizName: string, quizID: number, daneQuizu: string) {
    db.run('INSERT INTO quizzes (name, id) VALUES ("' + quizName + '", ' + quizID + ');');

    let dane = JSON.parse(daneQuizu);
    for (let i = 0; i < dane.pytania.length; i++) {
        db.run('INSERT INTO questions (quizID, id, question, answer1, answer2, answer3, correctAnswer) VALUES ("' + quizID + '", ' + i + ', "' + dane.pytania[i] + '", "' + dane.odp1[i] + '", "' + dane.odp2[i] + '", "' + dane.odp3[i] + '", "' + dane.odpPoprawnaId[i] + '");');
    }
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
    addQuizToDB("Quiz 1", 1, jsonDaneQuizu);
    addQuizToDB("Quiz 2", 2, jsonDaneQuizu);
    addQuizToDB("Quiz 3", 3, jsonDaneQuizu);
    addQuizToDB("Quiz 4", 4, jsonDaneQuizu);
    addQuizToDB("Quiz 5", 5, jsonDaneQuizu);
}

initDB();