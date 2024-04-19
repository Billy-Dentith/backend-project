const db = require('../db/connection');
const { selectTopics } = require('./topics.models');

exports.getArticleDataById = (article_id) => {
    const sqlString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, articles.article_img_url,
    COUNT(comments.article_id)::int AS comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id 
    WHERE articles.article_id=$1 
    GROUP BY articles.article_id;`

    return db.query(sqlString, [article_id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, message: 'Article does not exist'})
        }
        return rows[0]
    })
}

exports.getAllArticlesData = (topic, sort_by='created_at', order='desc', limit, page) => {
    return selectTopics().then((topicsArray) => {
        const validOrders = ['asc', 'desc'];
        const validSortBys = ['title', 'topic', 'author', 'created_at', 'votes']
        const validTopics = topicsArray.map((topics) => {
            return topics.slug;
        })

        let queryString = `
            SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
            COUNT(comments.article_id)::int AS comment_count
            FROM articles
            LEFT JOIN comments
            ON articles.article_id = comments.article_id `;
        const queryVals = []; 

        if (topic) {
            if (validTopics.includes(topic)) {
                queryString += `WHERE topic=$${queryVals.length + 1} `;
                queryVals.push(topic);
            } else {
                return Promise.reject({ status: 400, message: 'Invalid Query'})
            }
        }

        queryString += `GROUP BY articles.article_id `

        if (sort_by && order) {
            if (validSortBys.includes(sort_by) && validOrders.includes(order)) {
                queryString += `ORDER BY ${sort_by} ${order} `
            } else {
                return Promise.reject({ status: 400, message: 'Invalid Query'})
            }
        }
        
        let offset = 0;

        if (limit) {
            queryString += `LIMIT $${queryVals.length + 1} `
            queryVals.push(limit);
        }
        if (page) {
            if (!limit) {
                queryString += `LIMIT 10 `
                offset = (page - 1) * 10;
            } else {
                offset = (page - 1) * limit;
            }
            queryString += `OFFSET $${queryVals.length + 1} `
            queryVals.push(offset);
        }
        queryString += `;`;

        return db.query(queryString, queryVals)
        .then(({ rows }) => {
            return rows;
        })
    })
}

exports.checkArticleExists = (article_id) => {
    return db.query(`
    SELECT * 
    FROM articles 
    WHERE article_id=$1;`, 
    [article_id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, message: 'Article Does Not Exist'})
        }
    })
}

exports.updateArticleById = (article_id, { inc_votes }) => {
    return db.query(`
    UPDATE articles 
    SET votes = votes + $1 
    WHERE article_id=$2
    RETURNING*;`, 
    [inc_votes, article_id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, message: 'Article Does Not Exist'})
        }
        return rows[0];
    })
}

exports.insertArticle = ({ author, title, body, topic, article_img_url }) => {
    const queryVals = [author, title, body, topic, article_img_url]
    if (article_img_url) {
        queryStr = `
        INSERT INTO articles
            (author, title, body, topic, article_img_url)
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING*;`
    } else {
        queryStr = `
        INSERT INTO articles
            (author, title, body, topic)
        VALUES
            ($1, $2, $3, $4)
        RETURNING*;`
        queryVals.pop()
    }

    return db.query(queryStr, queryVals)
    .then(({ rows }) => {
        return this.getArticleDataById(rows[0].article_id)
    })
}

exports.removeArticleById = (article_id) => {
    return db.query(`
        DELETE FROM comments
        WHERE article_id=$1;`, 
        [article_id])
    .then(() => {
        return db.query(`
            DELETE FROM articles
            WHERE article_id=$1
            RETURNING*;`, 
            [article_id])
    })
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, message: 'Article Does Not Exist'})
        }
    })
}