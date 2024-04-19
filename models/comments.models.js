const db = require('../db/connection')
const format = require('pg-format')

exports.getCommentsByArticleIdData = (article_id, limit, page) => {
    let sqlString = `
        SELECT* 
        FROM comments
        WHERE article_id=$1
        ORDER BY created_at DESC `
    
    let offset = 0;
    const queryVals = [article_id];

    if (limit) {
        sqlString += `LIMIT $${queryVals.length + 1} `
        queryVals.push(limit);
    }
    if (page) {
        if (!limit) {
            sqlString += `LIMIT 10 `
            offset = (page - 1) * 10;
        } else {
            offset = (page - 1) * limit;
        }
        sqlString += `OFFSET $${queryVals.length + 1} `
        queryVals.push(offset);
    }

    sqlString += `;`
    
    return db.query(sqlString, queryVals).then(({ rows }) => {
        return rows;
    })
}

exports.insertComment = (body, username, article_id) => {
    const queryStr = `
    INSERT INTO comments
        (body, author, article_id)
    VALUES
        ($1, $2, $3)
    RETURNING*;`

    return db.query(queryStr, [body, username, article_id]).then(({ rows }) => {
        return rows[0]; 
    })
}

exports.removeCommentById = (comment_id) => {
    return db.query(`
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING*;`,
        [comment_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, message: 'Comment Does Not Exist'})
            }
        })
}

exports.updateCommentById = (comment_id, { inc_votes }) => {
    return db.query(`
        UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING*`, 
        [inc_votes, comment_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, message: 'Comment Does Not Exist'})
            }
            return rows[0];
        })
}