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
     * content VARCHAR(1000) NOT NULL
     */
    db.run('CREATE TABLE quizzes (name VARCHAR(255) NOT NULL, id INT NOT NULL PRIMARY KEY, content VARCHAR(1000) NOT NULL);');
    /* TABLE solutions
     * login VARCHAR(255) NOT NULL
     * quizID INT NOT NULL
     * times VARCHAR(255) NOT NULL
     * answers VARCHAR(255) NOT NULL
     * constraint id PRIMARY KEY (login, quizID)
     */
    db.run('CREATE TABLE solutions (login VARCHAR(255) NOT NULL, quizID INT NOT NULL, times VARCHAR(255) NOT NULL, answers VARCHAR(255) NOT NULL, constraint id PRIMARY KEY (login, quizID));');

}

createDB();