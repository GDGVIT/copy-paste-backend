const mongoose = require('mongoose')

const DeviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceToken: { type: String, required: true, required: true },
  deviceName: { type: String, required: true },
})

module.exports = mongoose.model('Devices', DeviceSchema)
