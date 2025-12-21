import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, runMigrations, generateId } from './db.js';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Echo test route
app.post('/api/echo', (req, res) => {
  res.json({ echo: req.body });
});

// Auth: signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, village, cultures } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already in use' });

    const id = generateId();
    const password_hash = await bcrypt.hash(password, 10);

    await query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [id, email, password_hash]);

    await query('INSERT INTO user_profiles (id, user_id, village, cultures, language) VALUES (?, ?, ?, ?, ?)', [generateId(), id, village || null, JSON.stringify(cultures || []), 'mg']);

    const token = jwt.sign({ userId: id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    res.json({ success: true, token });
  } catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const rows = await query('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth middleware
function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);
    res.json({ data: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or upsert profile for authenticated user
app.post('/api/profile', authenticateToken, async (req, res) => {
  const { village, cultures, language } = req.body || {};
  try {
    const existing = await query('SELECT id FROM user_profiles WHERE user_id = ?', [req.user.id]);
    if (existing.length) {
      await query('UPDATE user_profiles SET village = ?, cultures = ?, language = ? WHERE user_id = ?', [village, JSON.stringify(cultures || []), language || 'mg', req.user.id]);
      return res.json({ success: true, updated: true });
    }

    await query('INSERT INTO user_profiles (id, user_id, village, cultures, language) VALUES (?, ?, ?, ?, ?)', [generateId(), req.user.id, village || null, JSON.stringify(cultures || []), language || 'mg']);
    res.json({ success: true, created: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { village, cultures, language } = req.body || {};
  try {
    await query('UPDATE user_profiles SET village = ?, cultures = ?, language = ? WHERE user_id = ?', [village, JSON.stringify(cultures || []), language || 'mg', req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT id, title, data, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  const { title, data } = req.body || {};
  try {
    const id = generateId();
    await query('INSERT INTO favorites (id, user_id, title, data) VALUES (?, ?, ?, ?)', [id, req.user.id, title || null, JSON.stringify(data || {})]);
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/favorites/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    await query('DELETE FROM favorites WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Journal endpoints
app.get('/api/journal', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT id, title, content, created_at, updated_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/journal', authenticateToken, async (req, res) => {
  const { title, content } = req.body || {};
  try {
    const id = generateId();
    await query('INSERT INTO journal_entries (id, user_id, title, content) VALUES (?, ?, ?, ?)', [id, req.user.id, title || null, content || null]);
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/journal/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body || {};
  try {
    await query('UPDATE journal_entries SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, content, id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/journal/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    await query('DELETE FROM journal_entries WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settings (per-user key/value)
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT key_name, value FROM user_settings WHERE user_id = ?', [req.user.id]);
    const settings = {};
    rows.forEach(r => { try { settings[r.key_name] = JSON.parse(r.value); } catch (e) { settings[r.key_name] = r.value; }});
    res.json({ data: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const { key_name, value } = req.body || {};
  if (!key_name) return res.status(400).json({ error: 'key_name is required' });
  try {
    const existing = await query('SELECT id FROM user_settings WHERE user_id = ? AND key_name = ?', [req.user.id, key_name]);
    const serialized = JSON.stringify(value);
    if (existing.length) {
      await query('UPDATE user_settings SET value = ? WHERE id = ?', [serialized, existing[0].id]);
    } else {
      await query('INSERT INTO user_settings (id, user_id, key_name, value) VALUES (?, ?, ?, ?)', [generateId(), req.user.id, key_name, serialized]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT id, user_id, title, description, severity, active, created_at FROM alerts WHERE active = TRUE AND (user_id IS NULL OR user_id = ? ) ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/alerts', authenticateToken, async (req, res) => {
  const { title, description, severity = 'info', active = true } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const id = generateId();
    await query('INSERT INTO alerts (id, user_id, title, description, severity, active) VALUES (?, ?, ?, ?, ?, ?)', [id, req.user.id, title, description || null, severity, active ? 1 : 0]);
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/alerts/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { title, description, severity, active } = req.body || {};
  try {
    // Ensure owner
    const rows = await query('SELECT user_id FROM alerts WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await query('UPDATE alerts SET title = ?, description = ?, severity = ?, active = ? WHERE id = ?', [title, description, severity, typeof active === 'boolean' ? (active ? 1 : 0) : 1, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/alerts/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await query('SELECT user_id FROM alerts WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await query('DELETE FROM alerts WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advice entries
app.get('/api/advice', async (req, res) => {
  try {
    const rows = await query('SELECT id, author_id, title, body, tags, created_at FROM advice_entries ORDER BY created_at DESC');
    const out = rows.map(r => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [] }));
    res.json({ data: out });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/advice', authenticateToken, async (req, res) => {
  const { title, body, tags } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
  try {
    const id = generateId();
    await query('INSERT INTO advice_entries (id, author_id, title, body, tags) VALUES (?, ?, ?, ?, ?)', [id, req.user.id, title, body, JSON.stringify(tags || [])]);
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/advice/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { title, body, tags } = req.body || {};
  try {
    const rows = await query('SELECT author_id FROM advice_entries WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await query('UPDATE advice_entries SET title = ?, body = ?, tags = ? WHERE id = ?', [title, body, JSON.stringify(tags || []), id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/advice/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await query('SELECT author_id FROM advice_entries WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].author_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await query('DELETE FROM advice_entries WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT id, message, read, meta, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/notifications/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { read } = req.body || {};
  try {
    const rows = await query('SELECT user_id FROM notifications WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await query('UPDATE notifications SET read = ? WHERE id = ?', [read ? 1 : 0, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notifications', authenticateToken, async (req, res) => {
  const { user_id, message, meta } = req.body || {};
  if (!user_id || !message) return res.status(400).json({ error: 'user_id and message are required' });
  try {
    const id = generateId();
    await query('INSERT INTO notifications (id, user_id, message, meta) VALUES (?, ?, ?, ?)', [id, user_id, message, JSON.stringify(meta || {})]);
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attachments (metadata only)
app.get('/api/attachments', authenticateToken, async (req, res) => {
  try {
    const rows = await query('SELECT id, filename, mime_type, size, url, created_at FROM attachments WHERE owner_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/attachments', authenticateToken, async (req, res) => {
  const { filename, mime_type, size, url } = req.body || {};
  if (!filename || !url) return res.status(400).json({ error: 'filename and url are required' });
  try {
    const id = generateId();
    await query('INSERT INTO attachments (id, owner_id, filename, mime_type, size, url) VALUES (?, ?, ?, ?, ?, ?)', [id, req.user.id, filename, mime_type || null, size || 0, url]);
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/attachments/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await query('SELECT owner_id FROM attachments WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    if (rows[0].owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await query('DELETE FROM attachments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
(async function start() {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
