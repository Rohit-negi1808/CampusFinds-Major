const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users',       require('./routes/users'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/lost-items',  require('./routes/lostItems'));
app.use('/api/found-items', require('./routes/foundItems'));
app.use('/api/claims',      require('./routes/claims'));
app.use('/api/contact',     require('./routes/contact'));
app.use('/api/analytics',   require('./routes/analytics'));
app.use('/api/feedback',    require('./routes/feedback'));
app.use('/api/settings',    require('./routes/settings'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Shared helpers ───────────────────────────────────────────────────────────
const FoundItem  = require('./models/FoundItem');
const LostItem   = require('./models/LostItem');
const Claim      = require('./models/Claim');
const Settings   = require('./models/Settings');

const getSetting = async (key, fallback = null) => {
  const doc = await Settings.findOne({ key }).catch(() => null);
  return doc ? doc.value : fallback;
};

// ─── Cron 1: Claim Auto-Delete ────────────────────────────────────────────────
// Deletes found items whose claim was approved more than N days ago (10–15 days).
async function runClaimAutoDelete() {
  try {
    const enabled = await getSetting('claimAutoDeleteEnabled', false);
    if (!enabled) return;

    const days   = Number(await getSetting('claimAutoDeleteDays', 10));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const expiredClaims = await Claim.find({ status: 'approved', updatedAt: { $lte: cutoff } });
    if (!expiredClaims.length) return;

    const itemIds = expiredClaims.map(c => c.itemId);
    const result  = await FoundItem.deleteMany({ _id: { $in: itemIds }, status: 'claimed' });
    await Claim.deleteMany({ itemId: { $in: itemIds } });

    if (result.deletedCount > 0)
      console.log(`🗑️  [Claim Auto-Delete] Removed ${result.deletedCount} claimed item(s) older than ${days} day(s).`);
  } catch (err) {
    console.error('❌ [Claim Auto-Delete] Error:', err.message);
  }
}

// ─── Cron 2: Data Retention — unresolved items ────────────────────────────────
// Deletes lost + found items (status "found"/"lost", never resolved) older than N days.
async function runDataRetention() {
  try {
    const enabled = await getSetting('dataRetentionEnabled', false);
    if (!enabled) return;

    const days   = Number(await getSetting('dataRetentionDays', 90));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Delete unresolved found items (status = "found", never claimed)
    const foundResult = await FoundItem.deleteMany({
      status:    'found',
      createdAt: { $lte: cutoff }
    });

    // Delete unresolved lost items
    const lostResult = await LostItem.deleteMany({
      createdAt: { $lte: cutoff }
    });

    const total = foundResult.deletedCount + lostResult.deletedCount;
    if (total > 0)
      console.log(`🗑️  [Data Retention] Removed ${foundResult.deletedCount} found + ${lostResult.deletedCount} lost unresolved item(s) older than ${days} day(s).`);
  } catch (err) {
    console.error('❌ [Data Retention] Error:', err.message);
  }
}

// Run both crons at startup, then every hour
runClaimAutoDelete();
runDataRetention();
setInterval(runClaimAutoDelete, 60 * 60 * 1000);
setInterval(runDataRetention,   60 * 60 * 1000);
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CampusFinds API running on http://localhost:${PORT}`));