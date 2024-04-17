const { getAllTopics } = require('../controllers/topics.controllers');

const topicRouter = require('express').Router();

topicRouter.use('/', getAllTopics);

module.exports = topicRouter; 