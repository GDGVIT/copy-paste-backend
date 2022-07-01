const { join } = require('path')
const router = require('express').Router()
const Joi = require('joi')
const user = require(join(__dirname, '..', '..', '..', 'controllers', 'user.controller'))
const validate = require(join(__dirname, '..', '..', '..', 'middleware', 'validate.middleware'))
// const authorise = require(join(__dirname, '..', '..', '..', 'middleware', 'authorise.middleware'))

const schema = {
  signup: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    confirm: Joi.string().required()
  }),
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
}

router.post('/signup', validate(schema.signup, 'body'), user.signup)

router.post('/login', validate(schema.login, 'body'), user.login)

module.exports = router
