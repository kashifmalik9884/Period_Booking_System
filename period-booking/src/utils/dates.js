const pad = (value) => String(value).padStart(2, "0");

export const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getTodayKey = () => toDateKey(new Date());

// Accepts "2026-10-15", "2026-10-15T00:00:00.000Z" or a Date and returns "2026-10-15".
export const normalizeDate = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? "" : toDateKey(parsed);
};

// Parses "YYYY-MM-DD" as a local date (new Date("YYYY-MM-DD") would be UTC and can shift a day).
export const parseDateKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const format = (key, options) =>
  key ? parseDateKey(key).toLocaleDateString("en-GB", options) : "-";

export const formatLongDate = (key) =>
  format(key, { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

export const formatShortDate = (key) => format(key, { day: "2-digit", month: "short" });

export const formatWeekday = (key) => format(key, { weekday: "long" });

export const isSunday = (key) => parseDateKey(key).getDay() === 0;

// Next `count` Monday–Saturday dates. Admins also get today.
export const getSchoolDays = ({ count = 6, includeToday = false } = {}) => {
  const todayKey = getTodayKey();
  const cursor = parseDateKey(todayKey);
  const days = [];

  if (!includeToday) {
    cursor.setDate(cursor.getDate() + 1);
  }

  while (days.length < count) {
    if (cursor.getDay() !== 0) {
      const key = toDateKey(cursor);

      days.push({
        booking_date: key,
        day_name: formatWeekday(key),
        label: formatLongDate(key),
        is_today: key === todayKey,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};
