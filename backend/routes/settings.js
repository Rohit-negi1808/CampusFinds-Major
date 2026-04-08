const express = require('express');
const router  = express.Router();
const Settings = require('../models/Settings');

// GET a setting by key (with a default fallback)
router.get('/:key', async (req, res) => {
  try {
    const doc = await Settings.findOne({ key: req.params.key });
    res.json({ key: req.params.key, value: doc ? doc.value : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (upsert) a setting
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ error: 'value is required' });
    const doc = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;