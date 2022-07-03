const mongoose = require('mongoose')

const DataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: { type: [String], maxlength: 5 }
})

module.exports = mongoose.model('Data', DataSchema)
