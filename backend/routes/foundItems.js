const express = require('express');
const router = express.Router();
const FoundItems = require('../models/FoundItem');
const Claim = require('../models/Claim');

// GET all found items
router.get('/', async (req, res) => {
  try {
    const items = await FoundItems.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new found item
router.post('/', async (req, res) => {
  try {
    const newItem = new FoundItems(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (Update) a found item by ID
router.put('/:id', async (req, res) => {
  try {
    // Fetch the current item before updating to detect status change
    const currentItem = await FoundItems.findById(req.params.id);
    if (!currentItem) return res.status(404).json({ message: 'Item not found' });

    const updatedItem = await FoundItems.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const prevStatus = currentItem.status?.toLowerCase();
    const newStatus  = updatedItem.status?.toLowerCase();

    // If admin manually changes status from "claimed" back to "found",
    // reset the approved claim to "waiting" so it can be re-reviewed
    if (prevStatus === 'claimed' && newStatus === 'found') {
      await Claim.updateMany(
        { itemId: req.params.id, status: 'approved' },
        { status: 'waiting', adminNote: 'Reset: Item was manually reverted to Found by admin.' }
      );
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a found item by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await FoundItems.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;