const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check available rooms by type
router.get('/available', async (req, res) => {
  const { type } = req.query;
  if (!type) return res.status(400).json({ error: 'Room type is required' });
  try {
    // Get all rooms of this type
    const roomsResult = await pool.query('SELECT id FROM rooms WHERE type = $1', [type]);
    const roomIds = roomsResult.rows.map(r => r.id);
    if (roomIds.length === 0) return res.json({ available: 0 });
    // Get all active bookings for these rooms
    const bookingsResult = await pool.query(
      'SELECT room_id FROM bookings WHERE room_id = ANY($1) AND status = $2',
      [roomIds, 'booked']
    );
    const bookedRoomIds = new Set(bookingsResult.rows.map(b => b.room_id));
    // Available rooms = total - booked
    const available = roomIds.length - bookedRoomIds.size;
    res.json({ available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get room by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create room
router.post('/', async (req, res) => {
  const { type, price, description, status, photo_urls } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rooms (type, price, description, status, photo_urls) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [type, price, description, status || 'available', photo_urls]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  const { type, price, description, status, photo_urls } = req.body;
  try {
    const result = await pool.query(
      'UPDATE rooms SET type = $1, price = $2, description = $3, status = $4, photo_urls = $5 WHERE id = $6 RETURNING *',
      [type, price, description, status, photo_urls, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/test', (req, res) => res.json({ ok: true }));

module.exports = router; 