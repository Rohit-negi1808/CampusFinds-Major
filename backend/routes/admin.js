const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@campusfinds.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  const token = jwt.sign(
    { id: 'admin', email: adminEmail, role: 'admin', name: 'System Admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, admin: { id: 'admin', name: 'System Admin', email: adminEmail, role: 'admin' } });
});

module.exports = router;
