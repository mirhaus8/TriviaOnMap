const fs = require('fs');


const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
let sql;

module.export = {

}

const createTables = () => {

    const db = new sqlite3.Database('./worldConqueror.db', sqlite3.OPEN_READWRITE, (err) = {
        if(err) { return console.err(err.message) }
    });

    // create tables
    // sql = `CREATE TABLE users(username, password, best_time, best_team_time)`;
    // db.run(sql);
    // db.run('DROP TABLE countries_neighbors');
    // db.run('DROP TABLE questions');
    // db.run('DROP TABLE question_rank');
    sql = `CREATE TABLE countries_neighbors(country_name text PRIMARY KEY, neighbor_country text)`
    db.run(sql);

    sql = `CREATE TABLE questions(question_id integer PRIMARY KEY AUTOINCREMENT, question_rank integer, url text)`
    db.run(sql);

    sql = `CREATE TABLE question_rank(rank_name text PRIMARY KEY, rank_id integer)`
    db.run(sql);


}

const registerUser = (req) => {
    const db = new sqlite3.Database('./worldConqueror.db', sqlite3.OPEN_READWRITE, (err) = {
        if(err) { return console.err(err.message) }
    });
    let username = req.username;

    let password = req.password;
    if (username && password) {
        sql = `INSERT INTO users(username, password, best_time, best_team_time) VALUES (?,?,?,?)`;
        // sql = `INSERT INTO questions(question_rank, url) VALUES (?,?)`;
        db.run(sql, [username, password, "00:00:10", "00:00:00"], (err) => {
            if (err) return console.error(err.message);
        })
        // db.run(sql, [1, '/Users/hausmann/Documents/conquerThe 3/app/data/imgS.jpeg'], (err) => {
        //     if (err) return console.error(err.message);
        // })
        return 200;
    }
    return 400;
}
function createDBConnection(filename) {
    return open({
        filename,
        driver: sqlite3.Database
    })
}
const loginUser = async (req) => {
    const db = await createDBConnection('./worldConqueror.db')

    let username = req.username;
    let password = req.password;

    if (username && password) {
        let query = `
            SELECT * FROM users 
            WHERE username = "${username}" and password = "${password}"
            `;
        const row = await db.get(query, [])

        return row != undefined ? 200 : 400;
    }

}

const getQuestion = async (req) => {
    const db = await createDBConnection('./worldConqueror.db')

    let questionRank = req.rank;

    if (questionRank) {
        let query = `
            SELECT url FROM questions 
            WHERE question_rank = "${questionRank}"
            `;
        const row = await db.get(query, [])
        return row;
    }
}

const isCountryNeighbor = async (req) => {
    const db = await createDBConnection('./worldConqueror.db')

    let country_name = req.country_name;
    let neighbor_name = req.neighbor_name;

    if (questionRank) {
        let query = `
        SELECT url FROM questions 
        WHERE country_name = "${country_name}" and neighbor_country = "${neighbor_name}"
        `;
        const row = await db.get(query, [])
        return row;
    }
}

module.exports = { createTables, registerUser, loginUser, getQuestion, isCountryNeighbor }
