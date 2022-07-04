const { join } = require('path')
const express = require('express')
const app = express()
const http = require('http')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const errorhandler = require('errorhandler')
const cors = require('cors');
const morgan = require('morgan')
const mongoose = require('mongoose')
const routes = require(join(__dirname, 'api', 'routes', 'v1'))
const isProduction = true

require(join(__dirname, 'config', 'database'))

app.use(helmet()) // Prevent common security vulnerabilities
app.use(morgan('dev')) // log origin of request

const corsOptions = {
  origin: '*',
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus: 200
}

app.use(cors(corsOptions))

// Parse json body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// app.use(cors());

mongoose.Promise = global.Promise

if (!isProduction) app.use(errorhandler()) // development error handler

if (!isProduction) {
  app.use(function (err, req, res) {
    console.log(err.stack) // will print stacktrace

    res.status(err.status || 500)

    res.json({
      errors: {
        message: err.message,
        error: err
      }
    })
  })
}

app.use(function (err, req, res, next) { // no stacktraces leaked to users
  res.status(err.status || 500)
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  })
})

app.use('/api/v1/', routes)

const httpServer = http.createServer(app)
const PORT = process.env.PORT || 3000

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
