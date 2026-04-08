const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status:  { type: String, enum: ['pending','resolved'], default: 'pending' },
  adminReply: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('Contact', contactSchema);
