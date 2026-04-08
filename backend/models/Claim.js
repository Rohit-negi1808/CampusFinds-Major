const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId:        { type: String, required: true },
  itemType:      { type: String, enum: ['lost','found'], default: 'found' },
  claimantName:  { type: String, required: true },
  claimantEmail: { type: String, default: '' },
  contact:       { type: String, required: true },
  message:       { type: String, required: true, maxlength: 5000 },
  status:        { type: String, enum: ['waiting','approved','rejected'], default: 'waiting' },
  adminNote:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
