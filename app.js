const express = require('express');
const apiRouter = require('./routes/api-router');
const userRouter = require('./routes/users-router');
const commentRouter = require('./routes/comments-router');
const topicRouter = require('./routes/topics-router');
const articleRouter = require('./routes/articles-router');
const app = express();

app.use(express.json());

// Endpoint Routers
app.use('/api', apiRouter);

apiRouter.use('/users', userRouter);
apiRouter.use('/comments', commentRouter);
apiRouter.use('/topics', topicRouter);
apiRouter.use('/articles', articleRouter);

// Requests to Invalid Endpoints 
app.all('*', (req, res, next) => {
    res.status(404).send({ message: 'Endpoint Not Found'})
})

// Error Handling
app.use((err, req, res, next) => {
    if (err.status && err.message) {
        res.status(err.status).send({ message: err.message})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ message: 'Bad Request'})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.code === '23502') {
        res.status(400).send({ message: 'Bad Request'})
    }
})


module.exports = app;