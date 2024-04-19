const { checkArticleExists } = require("../models/articles.models")
const { getCommentsByArticleIdData, insertComment, removeCommentById, updateCommentById } = require("../models/comments.models")
const { checkUserExists } = require("../models/users.models")

exports.getCommentsByArticleId = (req, res, next) => {
    const article_id = req.params.article_id
    const { limit, page } = req.query;

    Promise.all([getCommentsByArticleIdData(article_id, limit, page), checkArticleExists(article_id)])
    .then(([ comments ]) => {
        res.status(200).send({ comments })
    }).catch(next)
}

exports.postComment = (req, res, next) => {
    const newComment = req.body 
    const article_id = req.params.article_id
    const acceptedProperties = ['body', 'username'];
    let validComment = true;

    Object.keys(newComment).forEach((key) => {
        if (!acceptedProperties.includes(key)) {
            validComment = false;
        }
    })

    if (validComment) {
        checkUserExists(newComment.username)
        .then(() => {
            insertComment(newComment, article_id)
            .then((comment) => {
                res.status(201).send({ comment })
            }).catch(next)
        }).catch(next)
    } else {
        res.status(400).send({ message: 'Invalid Comment' })
    }

    
}

exports.deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params; 
    removeCommentById(comment_id).then(() => {
        res.status(204).send()
    }).catch(next)
}

exports.patchComment = (req, res, next) => {
    const { comment_id } = req.params;
    const updComment = req.body;
    updateCommentById(comment_id, updComment).then((comment) => {
        res.status(202).send({ comment })
    }).catch(next)
}