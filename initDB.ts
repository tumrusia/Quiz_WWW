import * as sqlite3 from 'sqlite3';

sqlite3.verbose();
let db = new sqlite3.Database('quiz.db');

function addQuizToDB(quizName: string, quizID: number, daneQuizu: string) {
    let zapytanie = 'INSERT INTO quizzes (name, id, content) VALUES ("' + quizName + '", ' + quizID + ', "' + daneQuizu + '");';
    db.run(zapytanie);
}

let jsonDaneQuizu: string = `{
    ''pytania'': [
        ''Ile to 2-3?'',
        ''Ile to 1+1?'',
        ''Ile to 5*0?'',
        ''Ile to 36:9?''
    ],
    ''odp1'': [
        ''1'',
        ''11'',
        ''0'',
        ''5''
    ],
    ''odp2'': [
        ''2'',
        ''2'',
        ''-5'',
        ''4''
    ],
    ''odp3'': [
        ''-1'',
        ''1'',
        ''5'',
        ''3''
    ],
    ''odpPoprawnaId'': [
        ''2'',
        ''1'',
        ''0'',
        ''1''
    ]
}`;

function initDB() {
    addQuizToDB("Quiz 1", 1, jsonDaneQuizu);
    addQuizToDB("Quiz 2", 2, jsonDaneQuizu);
    addQuizToDB("Quiz 3", 3, jsonDaneQuizu);
    addQuizToDB("Quiz 4", 4, jsonDaneQuizu);
    addQuizToDB("Quiz 5", 5, jsonDaneQuizu);
}

function addUser(login, password) {
    //zakładam że tutaj dodawany jest unikatowy użytkownik
    db.run('INSERT INTO users (login, password) VALUES ("' + login + '", "' + password + '");');

}

initDB();
addUser("user1", "user1");
addUser("user2", "user2");