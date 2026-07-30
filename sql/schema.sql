CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin'
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  day_name VARCHAR(20) NOT NULL,
  period_no INT NOT NULL,
  room_name VARCHAR(20) NOT NULL,
  booked_by VARCHAR(100) NOT NULL,
  purpose VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_booking_slot UNIQUE (day_name, period_no, room_name),
  CONSTRAINT valid_day_name CHECK (day_name IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  CONSTRAINT valid_period_no CHECK (period_no BETWEEN 1 AND 7),
  CONSTRAINT valid_room_name CHECK (room_name IN ('AV Room 1', 'AV Room 2'))
);

CREATE TABLE booking_history (
  id SERIAL PRIMARY KEY,
  booking_id INT REFERENCES bookings(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by VARCHAR(50),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);