const { join } = require('path')
const router = require('express').Router()
const Joi = require('joi')
const data = require(join(__dirname, '..', '..', '..', 'controllers', 'data.controller'))
const validate = require(join(__dirname, '..', '..', '..', 'middleware', 'validate.middleware'))
// const authorise = require(join(__dirname, '..', '..', '..', 'middleware', 'authorise.middleware'))

const schema = {
    uploadImage: Joi.object().keys({
        // image should be a file
        image: Joi.object().required(),
        // deviceToken: Joi.stri`ng().required()
    }),
    sendMessage: Joi.object().keys({
        deviceToken: Joi.string().required(),
        message: Joi.string().required()
    }),
}

router.post('/uploadImage', data.uploadImage)

router.post('/sendMessage', data.sendMessage)

module.exports = router