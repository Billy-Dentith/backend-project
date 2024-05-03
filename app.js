const cors = require('cors')
const express = require('express');
const apiRouter = require('./routes/api-router');
const userRouter = require('./routes/users-router');
const commentRouter = require('./routes/comments-router');
const topicRouter = require('./routes/topics-router');
const articleRouter = require('./routes/articles-router');
const { handleInvalidEndpoint, handleCustomErrors, handlePsqlErrors, handleServerErrors } = require('./errors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

apiRouter.use('/users', userRouter);
apiRouter.use('/comments', commentRouter);
apiRouter.use('/topics', topicRouter);
apiRouter.use('/articles', articleRouter);

app.all('*', handleInvalidEndpoint);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;