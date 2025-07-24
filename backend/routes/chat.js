const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all chats
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chats ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chats WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create chat
router.post('/', async (req, res) => {
  const { user_id, agent_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO chats (user_id, agent_id) VALUES ($1, $2) RETURNING *',
      [user_id, agent_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a chat
router.get('/:id/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add message to a chat
router.post('/:id/messages', async (req, res) => {
  const { sender_id, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, sender_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 