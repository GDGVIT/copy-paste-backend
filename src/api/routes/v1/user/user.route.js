const { join } = require('path')
const router = require('express').Router()
const Joi = require('joi')
const user = require(join(__dirname, '..', '..', '..', 'controllers', 'user.controller'))
const validate = require(join(__dirname, '..', '..', '..', 'middleware', 'validate.middleware'))
const authorise = require(join(__dirname, '..', '..', '..', 'middleware', 'authorise.middleware'))

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
  }),
  addDevice: Joi.object({
    token: Joi.string().required(),
    type: Joi.string().required(),
    name: Joi.string().required()
  }),
  removeDevice: Joi.object({
    token: Joi.string(),
    name: Joi.string()
  }),
}

router.post('/signup', validate(schema.signup, 'body'), user.signup)

router.post('/login', validate(schema.login, 'body'), user.login)

router.post('/resend', validate(schema.resend, 'body'), user.resendEmail)

router.get('/verify/:id/:token', user.verify)

router.post('/add-device', authorise, validate(schema.addDevice, 'body'), user.addDevice)

router.delete('/remove-device', authorise, validate(schema.removeDevice, 'body'), user.removeDevice)

router.get('/devices', authorise, user.getDevices)

module.exports = router
