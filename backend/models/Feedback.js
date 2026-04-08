const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, lowercase: true, trim: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  itemRecovered: { type: String, default: '' },
  visible: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Feedback', feedbackSchema);
