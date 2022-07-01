require('dotenv').config()
const paseto = require('paseto') // Token Auth
const { V4: { verify } } = paseto
const key = process.env.PASERK_PUB

const authorise = async (req, res, next) => {
  let token = req.headers.authorization
  if (!token) { return res.status(401).json({ message: 'No token provided' }) }
  if (token.startsWith('Bearer ')) { token = token.slice(7, token.length) }
  if (token) {
    verify(token, key).then(payload => {
      req.user = payload
      next()
    }).catch(() => {
      res.status(401).json({ message: 'Invalid Token' })
    })
  } else {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authorise
