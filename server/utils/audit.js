const pool = require("../config/db");

async function addHistory({ bookingId, action, oldData, newData, changedBy }) {
  await pool.query(
    `INSERT INTO booking_history (booking_id, action, old_data, new_data, changed_by)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      bookingId || null,
      action,
      oldData || null,
      newData || null,
      changedBy || "system",
    ]
  );
}

module.exports = { addHistory };