const { getAllTopics, postTopic } = require('../controllers/topics.controllers');
const topicRouter = require('express').Router();

topicRouter.get('/', getAllTopics);
topicRouter.post('/', postTopic);

module.exports = topicRouter; 