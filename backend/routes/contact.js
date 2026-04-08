const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendEmail, feedbackResolvedEmail } = require('../utils/email');

router.get('/', async (req, res) => {
  try { res.json(await Contact.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/by-email/:email', async (req, res) => {
  try { res.json(await Contact.find({ email: req.params.email }).sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ error: 'All fields required' });
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id/resolve', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: 'resolved', adminReply: req.body.adminReply || '' }, { new: true });
    if (!contact) return res.status(404).json({ message: 'Not found' });
    // Notify user
    await sendEmail({ to: contact.email, subject: 'Your Feedback Has Been Resolved — CampusFinds', html: feedbackResolvedEmail(contact.name, contact.subject) });
    res.json(contact);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
