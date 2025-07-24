const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get booking by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
router.post('/', async (req, res) => {
  const { user_id, room_id, start_date, end_date, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO bookings (user_id, room_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, room_id, start_date, end_date, status || 'booked']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a room by type
router.post('/by-type', async (req, res) => {
  const { name, address, persons, type, start_date, end_date } = req.body;
  if (!type || !start_date || !end_date || !name || !address || !persons) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Find all rooms of this type
    const roomsResult = await pool.query('SELECT id FROM rooms WHERE type = $1', [type]);
    const roomIds = roomsResult.rows.map(r => r.id);
    if (roomIds.length === 0) return res.status(400).json({ error: 'No rooms of this type' });
    // Find booked rooms for the requested dates
    const bookingsResult = await pool.query(
      `SELECT room_id FROM bookings WHERE room_id = ANY($1) AND status = 'booked' AND NOT (end_date < $2 OR start_date > $3)`,
      [roomIds, start_date, end_date]
    );
    const bookedRoomIds = new Set(bookingsResult.rows.map(b => b.room_id));
    // Find an available room
    const availableRoomId = roomIds.find(id => !bookedRoomIds.has(id));
    if (!availableRoomId) return res.status(409).json({ error: 'No available rooms of this type for the selected dates' });
    // Create booking (user_id is optional for now)
    const bookingResult = await pool.query(
      'INSERT INTO bookings (user_id, room_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [null, availableRoomId, start_date, end_date, 'booked']
    );
    // Optionally, store guest info in a separate table or as JSON in bookings (not implemented here)
    res.status(201).json({ booking: bookingResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  const { user_id, room_id, start_date, end_date, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE bookings SET user_id = $1, room_id = $2, start_date = $3, end_date = $4, status = $5 WHERE id = $6 RETURNING *',
      [user_id, room_id, start_date, end_date, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 