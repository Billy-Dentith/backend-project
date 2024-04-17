const db = require('../db/connection');

exports.checkUserExists = (username) => {
    return db.query(`SELECT * FROM users WHERE username=$1`, [username])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, message: 'User Does Not Exist'})
        }
    })
}

exports.getUsersData = () => {
    return db.query(`SELECT * FROM users`)
    .then(({ rows }) => {
        return rows; 
    })
}

exports.getUserByUsernameData = (username) => {
    return db.query(`SELECT * FROM users WHERE username=$1`, [username])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, message: 'User Not Found'})
        }
        return rows[0];
    })
}