const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  location: String,
  linkedinProfile: String,
  emails: [String],
  phoneNumbers: [String],
  comments: String,
  communicationPeriodicity: String,
  lastCommunications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Communication' }],
});

module.exports = mongoose.model('Company', companySchema);
