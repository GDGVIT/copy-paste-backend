const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Devices' }],
  IsVerified: { type: Boolean, default: false }
})

module.exports = mongoose.model('User', UserSchema)
