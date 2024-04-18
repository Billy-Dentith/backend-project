const { getAllArticles, patchArticleById, getArticleById, postArticle } = require('../controllers/articles.controllers');
const { getCommentsByArticleId, postComment } = require('../controllers/comments.controllers');
const articleRouter = require('express').Router();

articleRouter.get('/', getAllArticles);
articleRouter.post('/', postArticle);

articleRouter.get('/:article_id', getArticleById);
articleRouter.patch('/:article_id', patchArticleById);

articleRouter.get('/:article_id/comments', getCommentsByArticleId);
articleRouter.post('/:article_id/comments', postComment);

module.exports = articleRouter; 