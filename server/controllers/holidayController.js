const pool = require("../config/db");
const { addHistory } = require("../utils/audit");
const { isValidDateString, getDayName, getTodayDateString } = require("../utils/dates");

exports.getHolidays = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, holiday_date, reason, created_by, created_at
       FROM holidays
       ORDER BY holiday_date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch holidays" });
  }
};

exports.addHoliday = async (req, res) => {
  const { holiday_date, reason } = req.body;

  if (!holiday_date) {
    return res.status(400).json({ message: "Holiday date is required" });
  }

  if (!isValidDateString(holiday_date)) {
    return res.status(400).json({ message: "Holiday date must be a valid date" });
  }

  if (holiday_date < getTodayDateString()) {
    return res.status(400).json({ message: "You cannot add a holiday in the past" });
  }

  if (getDayName(holiday_date) === "Sunday") {
    return res.status(400).json({ message: "Sundays are already non-working days" });
  }

  const cleanReason = typeof reason === "string" && reason.trim() ? reason.trim() : "Holiday";

  if (cleanReason.length > 200) {
    return res.status(400).json({ message: "Reason must be 200 characters or fewer" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO holidays (holiday_date, reason, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [holiday_date, cleanReason, req.user.username]
    );

    const holiday = result.rows[0];

    // Bookings already on this date are kept, but they are hidden behind the holiday.
    const affected = await pool.query(
      "SELECT COUNT(*)::int AS count FROM bookings WHERE booking_date = $1",
      [holiday_date]
    );

    await addHistory({
      bookingId: null,
      action: "HOLIDAY_ADD",
      oldData: null,
      newData: holiday,
      changedBy: req.user.username,
    });

    res.status(201).json({ ...holiday, affected_bookings: affected.rows[0].count });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "This date is already marked as a holiday" });
    }

    res.status(500).json({ message: "Failed to add holiday" });
  }
};

exports.deleteHoliday = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query("SELECT * FROM holidays WHERE id = $1", [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    await pool.query("DELETE FROM holidays WHERE id = $1", [id]);

    await addHistory({
      bookingId: null,
      action: "HOLIDAY_REMOVE",
      oldData: existing.rows[0],
      newData: null,
      changedBy: req.user.username,
    });

    res.json({ message: "Holiday removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove holiday" });
  }
};
