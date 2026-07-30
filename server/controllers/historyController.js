const pool = require("../config/db");

exports.getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         booking_id,
         action,
         old_data,
         new_data,
         changed_by,
         changed_at
       FROM booking_history
       ORDER BY changed_at DESC, id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking history" });
  }
};