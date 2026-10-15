// School runs on Indian time. Render servers run in UTC, so "today" must be computed explicitly.
const TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const isValidDateString = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

// Expects a valid YYYY-MM-DD string.
const getDayName = (dateString) =>
  DAY_NAMES[new Date(`${dateString}T00:00:00Z`).getUTCDay()];

const getTodayDateString = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

module.exports = { isValidDateString, getDayName, getTodayDateString };
