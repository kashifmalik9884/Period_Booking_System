const pool = require("../config/db");
const { addHistory } = require("../utils/audit");

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const validRooms = ["AV Room 1", "AV Room 2"];

const getDayNameFromDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const validateBookingInput = ({
  booking_date,
  period_no,
  room_name,
  booked_by,
  purpose,
}) => {
  if (!booking_date) {
    return "Booking date is required";
  }

  const dayName = getDayNameFromDate(booking_date);

  if (!validDays.includes(dayName)) {
    return "Bookings are allowed only from Monday to Saturday";
  }

  if (booking_date <= getTodayDateString()) {
    return "You can book only future dates";
  }

  if (!period_no || Number(period_no) < 1 || Number(period_no) > 7) {
    return "Period number must be between 1 and 7";
  }

  if (!room_name || !validRooms.includes(room_name)) {
    return "Valid room is required";
  }

  if (!booked_by || !booked_by.trim()) {
    return "Booked by is required";
  }

  if (!purpose || !purpose.trim()) {
    return "Purpose is required";
  }

  return null;
};

exports.getBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM bookings
       ORDER BY booking_date ASC, period_no ASC, room_name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  const { booking_date, period_no, room_name, booked_by, purpose } = req.body;
  const day_name = getDayNameFromDate(booking_date);

  const validationError = validateBookingInput({
    booking_date,
    period_no,
    room_name,
    booked_by,
    purpose,
  });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookings (booking_date, day_name, period_no, room_name, booked_by, purpose)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [booking_date, day_name, Number(period_no), room_name, booked_by.trim(), purpose.trim()]
    );

    await addHistory({
      bookingId: result.rows[0].id,
      action: "CREATE",
      oldData: null,
      newData: result.rows[0],
      changedBy: req.user ? req.user.username : "system",
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "This slot is already booked for the selected date" });
    }

    res.status(500).json({ message: "Failed to create booking" });
  }
};

exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { booking_date, period_no, room_name, booked_by, purpose } = req.body;
  const day_name = getDayNameFromDate(booking_date);

  const validationError = validateBookingInput({
    booking_date,
    period_no,
    room_name,
    booked_by,
    purpose,
  });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const oldResult = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const oldData = oldResult.rows[0];

    const result = await pool.query(
      `UPDATE bookings
       SET booking_date = $1,
           day_name = $2,
           period_no = $3,
           room_name = $4,
           booked_by = $5,
           purpose = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [booking_date, day_name, Number(period_no), room_name, booked_by.trim(), purpose.trim(), id]
    );

    await addHistory({
      bookingId: Number(id),
      action: "UPDATE",
      oldData,
      newData: result.rows[0],
      changedBy: req.user.username,
    });

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "This slot is already booked for the selected date" });
    }

    res.status(500).json({ message: "Failed to update booking" });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const oldResult = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await addHistory({
      bookingId: Number(id),
      action: "DELETE",
      oldData: oldResult.rows[0],
      newData: null,
      changedBy: req.user.username,
    });

    await pool.query("DELETE FROM bookings WHERE id = $1", [id]);

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
};