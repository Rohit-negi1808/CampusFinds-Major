const mongoose = require('mongoose');
const foundItemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true },
  dateFound:   Date,
  location:    { type: String, required: true },
  imageUrl:    String,
  contact:     { type: String, required: true },
  status:      { type: String, enum: ['found', 'claimed', 'returned'], default: 'found' },
  reportedBy:  String,
}, { timestamps: true });
module.exports = mongoose.model('FoundItems', foundItemSchema);
