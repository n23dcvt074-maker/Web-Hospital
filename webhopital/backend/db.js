const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Wrapper function to mimic sqlite3 callback style
const db = {
  run: (query, params, callback) => {
    pool.query(query, params, (err, result) => {
      if (callback) {
        callback(err, result);
      }
    });
  },

  all: (query, params, callback) => {
    pool.query(query, params, (err, result) => {
      if (callback) {
        callback(err, result ? result.rows : null);
      }
    });
  },

  get: (query, params, callback) => {
    pool.query(query, params, (err, result) => {
      if (callback) {
        callback(err, result ? result.rows[0] : null);
      }
    });
  },

  exec: (sql, callback) => {
    // For executing multiple statements (schema creation)
    const statements = sql.split(';').filter(s => s.trim());
    let completed = 0;
    if (statements.length === 0) {
      if (callback) callback(null);
      return;
    }

    statements.forEach((statement) => {
      if (statement.trim()) {
        pool.query(statement, (err) => {
          if (err) {
            if (callback) callback(err);
            return;
          }
          completed++;
          if (completed === statements.length && callback) {
            callback(null);
          }
        });
      }
    });
  },

  close: (callback) => {
    pool.end(callback);
  },
};

module.exports = db;
