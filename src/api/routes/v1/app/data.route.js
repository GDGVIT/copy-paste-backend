const { join } = require('path')
const router = require('express').Router()
const Joi = require('joi')
const data = require(join(__dirname, '..', '..', '..', 'controllers', 'data.controller'))
const validate = require(join(__dirname, '..', '..', '..', 'middleware', 'validate.middleware'))
const authorise = require(join(__dirname, '..', '..', '..', 'middleware', 'authorise.middleware'))

const schema = {
    uploadImage: Joi.object({
        // image should be a file
        image: Joi.object().required(),
        deviceToken: Joi.string().required(),
    }),
    sendMessage: Joi.object({
        deviceToken: Joi.string().required(),
        message: Joi.string().required()
    })
}

router.post('/uploadImage', authorise, validate(schema.uploadImage, 'body'), data.uploadImage)

router.post('/sendMessage', authorise, validate(schema.sendMessage, 'body'), data.sendMessage)

module.exports = router