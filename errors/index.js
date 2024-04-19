exports.handleInvalidEndpoint = (req, res, next) => {
    res.status(404).send({ message: 'Endpoint Not Found'})
}

exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status && err.message) {
        res.status(err.status).send({ message: err.message })
    }
    next(err)
}

exports.handlePsqlErrors = (err, req, res, next) => {
    if (err.code === '22P02' || err.code === '23502') {
        res.status(400).send({ message: 'Bad Request' })
    }
    next(err)
}

exports.handleServerErrors = (err, req, res, next) => {
    res.status(500).send({ message: 'Internal Server Error' })
}