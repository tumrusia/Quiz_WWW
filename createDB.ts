import * as sqlite3 from 'sqlite3';

sqlite3.verbose();
let db = new sqlite3.Database('quiz.db');

function createDB() {
    /* TABLE users
     * users VARCHAR(255) NOT NULL PRIMARY KEY
     * password VARCHAR(20) NOT NULL
     */
    db.run('CREATE TABLE users (login VARCHAR(255) NOT NULL PRIMARY KEY, password VARCHAR(255) NOT NULL);');
    /* TABLE quizzes
     * name VARCHAR(255) NOT NULL
     * id INT NOT NULL PRIMARY KEY
     */
    db.run('CREATE TABLE quizzes (name VARCHAR(255) NOT NULL, id INT NOT NULL PRIMARY KEY);');
    /* TABLE questions
     * quizID INT NOT NULL
     * id INT NOT NULL
     * question VARCHAR(255) NOT NULL
     * answer1 VARCHAR(255) NOT NULL
     * answer2 VARCHAR(255) NOT NULL
     * answer3 VARCHAR(255) NOT NULL
     * correctAnswer INT NOT NULL
     * CONSTRAINT key PRIMARY KEY (quizID, id)
     */
    db.run('CREATE TABLE questions (quizID INT NOT NULL, id INT NOT NULL, question VARCHAR(255) NOT NULL, answer1 VARCHAR(255) NOT NULL, answer2 VARCHAR(255) NOT NULL, answer3 VARCHAR(255) NOT NULL, correctAnswer INT NOT NULL, CONSTRAINT key PRIMARY KEY (quizID, id));');
}

createDB();