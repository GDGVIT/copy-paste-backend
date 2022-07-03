const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  token: { type: String, required: true }
})

const Token = mongoose.model('token', tokenSchema)

module.exports = Token
