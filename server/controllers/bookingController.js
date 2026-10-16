const pool = require("../config/db");
const { addHistory } = require("../utils/audit");
const { isValidDateString, getDayName, getTodayDateString } = require("../utils/dates");

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const validRooms = ["AV Room 1", "AV Room 2"];

// Public visitors can only book future dates. Admins can also book today.
const validateBookingInput = (
  { booking_date, period_no, room_name, booked_by, purpose },
  isAdmin
) => {
  if (!booking_date) {
    return "Booking date is required";
  }

  if (!isValidDateString(booking_date)) {
    return "Booking date must be a valid date";
  }

  if (!validDays.includes(getDayName(booking_date))) {
    return "Bookings are allowed only from Monday to Saturday";
  }

  const today = getTodayDateString();

  if (isAdmin) {
    if (booking_date < today) {
      return "You cannot book a past date";
    }
  } else if (booking_date <= today) {
    return "You can book only future dates";
  }

  const period = Number(period_no);

  if (!Number.isInteger(period) || period < 1 || period > 7) {
    return "Period number must be between 1 and 7";
  }

  if (!room_name || !validRooms.includes(room_name)) {
    return "Valid room is required";
  }

  if (typeof booked_by !== "string" || !booked_by.trim()) {
    return "Booked by is required";
  }

  if (booked_by.trim().length > 100) {
    return "Booked by must be 100 characters or fewer";
  }

  if (typeof purpose !== "string" || !purpose.trim()) {
    return "Purpose is required";
  }

  if (purpose.trim().length > 200) {
    return "Purpose must be 200 characters or fewer";
  }

  return null;
};

const findHoliday = async (dateString) => {
  const result = await pool.query("SELECT * FROM holidays WHERE holiday_date = $1", [
    dateString,
  ]);

  return result.rows[0] || null;
};

const holidayMessage = (holiday) =>
  `${holiday.holiday_date} is a holiday (${holiday.reason}). Slots cannot be booked on holidays.`;

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
  const isAdmin = req.user?.role === "admin";

  const validationError = validateBookingInput(req.body, isAdmin);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const holiday = await findHoliday(booking_date);

    if (holiday) {
      return res.status(409).json({ message: holidayMessage(holiday) });
    }

    const result = await pool.query(
      `INSERT INTO bookings (booking_date, day_name, period_no, room_name, booked_by, purpose)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        booking_date,
        getDayName(booking_date),
        Number(period_no),
        room_name,
        booked_by.trim(),
        purpose.trim(),
      ]
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

  // This route is admin-only, so admin rules apply.
  const validationError = validateBookingInput(req.body, true);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const oldResult = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const oldData = oldResult.rows[0];

    const holiday = await findHoliday(booking_date);

    if (holiday) {
      return res.status(409).json({ message: holidayMessage(holiday) });
    }

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
      [
        booking_date,
        getDayName(booking_date),
        Number(period_no),
        room_name,
        booked_by.trim(),
        purpose.trim(),
        id,
      ]
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
