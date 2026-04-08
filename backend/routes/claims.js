const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const { sendEmail, claimStatusEmail } = require('../utils/email');

// GET all claims
router.get('/', async (req, res) => {
  try { res.json(await Claim.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// GET claims by email
router.get('/by-email/:email', async (req, res) => {
  try {
    const claims = await Claim.find({ claimantEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST new claim
router.post('/', async (req, res) => {
  try {
    const { itemId, itemType, claimantName, claimantEmail, contact, message } = req.body;
    if (!itemId || !claimantName || !contact || !message) {
      return res.status(400).json({ error: 'itemId, claimantName, contact and message are required' });
    }

    // Block new claims if item already has an approved claim
    const existingApproved = await Claim.findOne({ itemId, status: 'approved' });
    if (existingApproved) {
      return res.status(409).json({ error: 'This item has already been claimed and approved.' });
    }

    const claim = await Claim.create({
      itemId, itemType: itemType || 'found',
      claimantName, claimantEmail: claimantEmail || '',
      contact, message
    });
    res.status(201).json(claim);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT update claim status (with optional email notification)
router.put('/:id', async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['waiting', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Fetch claim before updating to get itemId/itemType
    const existingClaim = await Claim.findById(req.params.id);
    if (!existingClaim) return res.status(404).json({ message: 'Claim not found' });

    // Guard: block approving if another claim for the same item is already approved
    if (status === 'approved') {
      const alreadyApproved = await Claim.findOne({
        itemId: existingClaim.itemId,
        status: 'approved',
        _id: { $ne: req.params.id }
      });
      if (alreadyApproved) {
        return res.status(409).json({ error: 'Another claim for this item is already approved.' });
      }
    }

    // Update this claim
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '' },
      { new: true }
    );

    // AUTO-UPDATE FOUND ITEM + AUTO-REJECT OTHERS
    if (claim.itemType === 'found') {
      if (status === 'approved') {
        // Mark the found item as claimed
        await FoundItem.findByIdAndUpdate(claim.itemId, { status: 'claimed' });

        // Auto-reject all other pending claims for the same item
        const otherPending = await Claim.find({
          itemId: claim.itemId,
          status: { $in: ['waiting', 'pending'] },
          _id: { $ne: claim._id }
        });

        for (const other of otherPending) {
          await Claim.findByIdAndUpdate(other._id, {
            status: 'rejected',
            adminNote: 'Auto-rejected: Another claim for this item was approved.'
          });

          // Notify other claimants via email
          if (other.claimantEmail) {
            await sendEmail({
              to: other.claimantEmail,
              subject: `Your Claim Has Been Reviewed — CampusFinds`,
              html: claimStatusEmail(
                other.claimantName,
                `Item #${other.itemId.slice(-5)}`,
                'rejected',
                'Another claim for this item was approved.'
              )
            }).catch(() => {});
          }
        }
      }

      if (status === 'rejected') {
        // Revert found item to "found" only if no other approved claim exists
        const otherApproved = await Claim.findOne({
          itemId: claim.itemId,
          status: 'approved',
          _id: { $ne: claim._id }
        });
        if (!otherApproved) {
          await FoundItem.findByIdAndUpdate(claim.itemId, { status: 'found' });
        }
      }
    }

    // Send email to this claimant
    if (claim.claimantEmail && (status === 'approved' || status === 'rejected')) {
      await sendEmail({
        to: claim.claimantEmail,
        subject: `Your Claim Has Been ${status === 'approved' ? 'Approved ✅' : 'Reviewed'} — CampusFinds`,
        html: claimStatusEmail(claim.claimantName, `Item #${claim.itemId.slice(-5)}`, status, adminNote)
      }).catch(() => {});
    }

    res.json(claim);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;