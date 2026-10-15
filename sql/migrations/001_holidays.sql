-- Run this once on an EXISTING database (e.g. your Neon project) to add holiday support.
-- It is safe to run more than once. A fresh install should use sql/schema.sql instead.

-- 1. Make sure bookings are tied to a calendar date.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;

-- 2. A slot must be unique per date. Replace the old weekday-based rule if it is still there,
--    otherwise a Monday booking would block every other Monday.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS unique_booking_slot;
CREATE UNIQUE INDEX IF NOT EXISTS unique_booking_slot_date
  ON bookings (booking_date, period_no, room_name);

-- 3. Holidays.
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  holiday_date DATE UNIQUE NOT NULL,
  reason VARCHAR(200) NOT NULL DEFAULT 'Holiday',
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
