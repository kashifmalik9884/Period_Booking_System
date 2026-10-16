const { Pool, types } = require("pg");

// Return DATE columns as plain "YYYY-MM-DD" strings. By default pg turns them into
// JS Date objects at local midnight, which can shift the day when serialised to JSON.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
