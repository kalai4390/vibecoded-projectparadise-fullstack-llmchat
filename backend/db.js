const { Pool } = require('pg');
const pool = new Pool({
  user: 'resortuser',
  host: 'localhost',
  database: 'resortapp',
  password: 'resortpass',
  port: 5432,
});
module.exports = pool; 