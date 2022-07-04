const { join } = require('path')
const express = require('express')

// import all the routes here
const userRoute = require(join(__dirname, 'user', 'user.route'))
const dataRoute = require(join(__dirname, 'app', 'data.route'))
const router = express.Router()

router.use('/user', userRoute)
router.use('/data', dataRoute)

module.exports = router
