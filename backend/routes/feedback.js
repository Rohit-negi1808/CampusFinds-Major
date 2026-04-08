const express = require('express');
const router  = express.Router();
const Feedback = require('../models/Feedback');

// GET all (admin)
router.get('/', async (req, res) => {
  try { res.json(await Feedback.find().sort({ createdAt: -1 })); }
  catch(e){ res.status(500).json({ error: e.message }); }
});

// GET public visible ones (for landing/home success stories)
router.get('/public', async (req, res) => {
  try { res.json(await Feedback.find({ visible: true }).sort({ createdAt: -1 }).limit(20)); }
  catch(e){ res.status(500).json({ error: e.message }); }
});

// POST submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, message, itemRecovered } = req.body;
    if (!name || !email || !rating || !message) return res.status(400).json({ error: 'name, email, rating and message are required' });
    const fb = await Feedback.create({ name, email, rating: Number(rating), message, itemRecovered: itemRecovered || '' });
    res.status(201).json(fb);
  } catch(e){ res.status(400).json({ error: e.message }); }
});

// DELETE (admin removes)
router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch(e){ res.status(500).json({ error: e.message }); }
});

// PATCH toggle visibility
router.patch('/:id/toggle', async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: 'Not found' });
    fb.visible = !fb.visible;
    await fb.save();
    res.json(fb);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

module.exports = router;
