const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const signToken = user => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

/* ── CU Email / Student-ID validators ── */
const VALID_EMAIL_DOMAINS = ['cuchd.in', 'chandigarhuniversity.ac.in', 'cu.ac.in'];
const isCollegeEmail = email => {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return VALID_EMAIL_DOMAINS.some(d => domain === d || domain?.endsWith('.' + d));
};

// Student ID: flexible pattern covering 24MCA20481, 21BCS1234, UID12345, etc.
const isValidStudentId = id => /^[A-Za-z0-9]{6,15}$/.test(id?.trim() || '');

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;
    if (!name || !email || !password || !studentId)
      return res.status(400).json({ message: 'All fields are required' });

    if (!isCollegeEmail(email))
      return res.status(400).json({ message: 'Please use your Chandigarh University email (e.g. 24MCA20481@cuchd.in)' });

    if (!isValidStudentId(studentId))
      return res.status(400).json({ message: 'Invalid Student ID format. Use your CU ID like 24MCA20481 or 21BCS1234' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'This email is already registered' });

    if (await User.findOne({ studentId: studentId.toUpperCase().trim() }))
      return res.status(400).json({ message: 'This Student ID is already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      studentId: studentId.toUpperCase().trim(),
      role: 'user', status: 'active'
    });
    const token = signToken(user);
    res.status(201).json({
      message: 'Registered successfully',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, studentId: user.studentId }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (user.status === 'suspended')
      return res.status(403).json({ message: 'Account suspended. Contact Student Care.' });
    const token = signToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, studentId: user.studentId } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all users (admin)
router.get('/', async (req, res) => {
  try { res.json(await User.find().select('-password').sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/users/status/:id
router.put('/status/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;