const { join } = require('path')
const router = require('express').Router()
const Joi = require('joi')
const user = require(join(__dirname, '..', '..', '..', 'controllers', 'user.controller'))
const validate = require(join(__dirname, '..', '..', '..', 'middleware', 'validate.middleware'))
// const authorise = require(join(__dirname, '..', '..', '..', 'middleware', 'authorise.middleware'))

const schema = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirm: Joi.string().required()
  }),
  login: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
  }),
  resend: Joi.object({
    email: Joi.string().email().required()
  })
}

router.post('/signup', validate(schema.signup, 'body'), user.signup)

router.post('/login', validate(schema.login, 'body'), user.login)

router.post('/resend', validate(schema.resend, 'body'), user.resendEmail)

router.get('/verify/:id/:token', user.verify)

module.exports = router
