const { getUsers, getUsersByUsername } = require('../controllers/users.controllers');
const userRouter = require('express').Router();

userRouter.get('/', getUsers);
userRouter.get('/:username', getUsersByUsername);

module.exports = userRouter; 