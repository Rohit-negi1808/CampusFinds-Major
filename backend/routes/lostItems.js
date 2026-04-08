const express = require('express');
const router = express.Router();
const LostItems = require('../models/LostItem'); 

// GET all lost items
router.get('/', async (req, res) => {
  try {
    const items = await LostItems.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST a new lost item
router.post('/', async (req, res) => {
  try {
    const newItem = new LostItems(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (Update) a lost item by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await LostItems.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a lost item by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await LostItems.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;