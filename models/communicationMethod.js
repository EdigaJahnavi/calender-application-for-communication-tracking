const mongoose = require('mongoose');

const communicationMethodSchema = new mongoose.Schema({
  name: String,
  description: String,
  sequence: Number,
  mandatory: Boolean,
});

module.exports = mongoose.model('CommunicationMethod', communicationMethodSchema);
