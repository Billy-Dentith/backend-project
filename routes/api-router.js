const { getEndpoints, getHealthCheck } = require('../controllers/app.controllers');
const apiRouter = require('express').Router();

apiRouter.get('/', getEndpoints);
apiRouter.get('/healthcheck', getHealthCheck)

module.exports = apiRouter; 