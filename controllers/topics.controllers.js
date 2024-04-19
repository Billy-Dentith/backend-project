const { selectTopics, insertTopic } = require('../models/topics.models');

exports.getAllTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        res.status(200).send({ topics });
    }).catch(next)
}

exports.postTopic = (req, res, next) => {
    const newTopic = req.body;
    const acceptedProperties = ['slug', 'description'];
    let validTopic = true;

    Object.keys(newTopic).forEach((key) => {
        if (!acceptedProperties.includes(key)) {
            validTopic = false;
        }
    })

    if (validTopic) {
        insertTopic(newTopic).then((topic) => {
            res.status(201).send({ topic })
        }).catch(next)
    } else {
        res.status(400).send({ message: 'Invalid Topic' })
    }
}