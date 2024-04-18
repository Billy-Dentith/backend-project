const { getArticleDataById, getAllArticlesData, updateArticle, insertArticle, getArticleCount } = require("../models/articles.models")

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    getArticleDataById(article_id).then((article) => {
        res.status(200).send({ article })
    }).catch(next)
}

exports.getAllArticles = (req, res, next) => {
    const { topic, sort_by, order, limit, page } = req.query; 

    Promise.all([getAllArticlesData(topic, sort_by, order, limit, page), getAllArticlesData(topic)])
    .then(([paginatedArticles, allArticals]) => {
        res.status(200).send({ articles: paginatedArticles, total_count: allArticals.length  })
    }).catch(next)
}

exports.patchArticleById = (req, res, next) => {
    const { article_id } = req.params;
    const updArticle = req.body;
    updateArticle(article_id, updArticle).then((article) => {
        res.status(202).send({ article })
    }).catch(next)
}

exports.postArticle = (req, res, next) => {
    const newArticle = req.body;
    const acceptedProperties = ['author', 'title', 'body', 'topic'];
    let validArticle = true;

    Object.keys(newArticle).forEach((key) => {
        if (!acceptedProperties.includes(key)) {
            validArticle = false;
        }
    })

    if (validArticle) {
        insertArticle(newArticle).then((article) => {
            res.status(201).send({ article })
        }).catch(next)
    } else {
        res.status(400).send({ message: 'Invalid Article' })
    }
}