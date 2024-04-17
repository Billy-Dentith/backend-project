const { getUsersData, getUserByUsernameData } = require("../models/users.models")

exports.getUsers = (req, res, next) => {
    getUsersData().then((users) => {
        res.status(200).send({ users })
    })
}

exports.getUsersByUsername = (req, res, next) => {
    const { username } = req.params
    getUserByUsernameData(username).then((user) => {
        res.status(200).send({ user })
    }).catch(next)
}
