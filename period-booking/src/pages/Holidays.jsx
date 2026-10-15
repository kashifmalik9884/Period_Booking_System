import React, { useCallback, useEffect, useMemo, useState } from "react";
import { addHoliday, deleteHoliday, getHolidays } from "../api/bookings";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formatLongDate, getTodayKey, isSunday, normalizeDate } from "../utils/dates";

export default function Holidays() {
  const { token } = useAuth();

  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({ holiday_date: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const todayKey = useMemo(() => getTodayKey(), []);

  const loadHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getHolidays();
      setHolidays(
        res.data.map((holiday) => ({
          ...holiday,
          holiday_date: normalizeDate(holiday.holiday_date),
        }))
      );
    } catch (requestError) {
      setError("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const upcoming = holidays.filter((holiday) => holiday.holiday_date >= todayKey);
  const past = holidays.filter((holiday) => holiday.holiday_date < todayKey).reverse();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!form.holiday_date) {
      setMessage({ type: "error", text: "Please choose a date" });
      return;
    }

    if (isSunday(form.holiday_date)) {
      setMessage({ type: "error", text: "Sundays are already non-working days" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await addHoliday(form, token);
      const affected = res.data.affected_bookings || 0;

      setMessage({
        type: "success",
        text:
          affected > 0
            ? `Holiday added. ${affected} existing booking${affected === 1 ? "" : "s"} on that day will stay hidden while it is a holiday.`
            : "Holiday added. Slots on that day now show as Holiday.",
      });
      setForm({ holiday_date: "", reason: "" });
      await loadHolidays();
    } catch (requestError) {
      setMessage({
        type: "error",
        text: requestError.response?.data?.message || "Failed to add holiday",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (holiday) => {
    const confirmed = window.confirm(
      `Remove the holiday on ${formatLongDate(holiday.holiday_date)}? Slots on that day will open for booking again.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage({ type: "", text: "" });
      await deleteHoliday(holiday.id, token);
      setHolidays((previous) => previous.filter((item) => item.id !== holiday.id));
      setMessage({ type: "success", text: "Holiday removed" });
    } catch (requestError) {
      setMessage({
        type: "error",
        text: requestError.response?.data?.message || "Failed to remove holiday",
      });
    }
  };

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Holidays"
        subtitle="Mark days the school is closed. Every slot on a holiday shows as Holiday and cannot be booked."
      />

      <div className="card">
        <div className="card-head">
          <div>
            <h2>Add a holiday</h2>
            <p className="helper-text">You can mark today or any upcoming Monday to Saturday.</p>
          </div>
        </div>

        {message.text && (
          <p className={message.type === "error" ? "error-text" : "success-text"}>{message.text}</p>
        )}

        <form className="holiday-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Date</span>
            <input
              type="date"
              min={todayKey}
              value={form.holiday_date}
              onChange={(e) => setForm((prev) => ({ ...prev, holiday_date: e.target.value }))}
              disabled={submitting}
            />
          </label>

          <label className="field field-wide">
            <span className="field-label">Reason</span>
            <input
              placeholder="e.g. Diwali, Teachers' training day"
              maxLength={200}
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              disabled={submitting}
            />
          </label>

          <div className="field field-action">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Adding..." : "Add holiday"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="card">
          <p className="info-text">Loading holidays...</p>
        </div>
      ) : error ? (
        <div className="card">
          <p className="error-text">{error}</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Upcoming holidays</h2>
                <p className="helper-text">{upcoming.length} scheduled</p>
              </div>
            </div>

            {upcoming.length === 0 ? (
              <div className="empty-state">No upcoming holidays.</div>
            ) : (
              <ul className="holiday-list">
                {upcoming.map((holiday) => (
                  <li key={holiday.id} className="holiday-item">
                    <div className="holiday-date">
                      <strong>{formatLongDate(holiday.holiday_date)}</strong>
                      {holiday.holiday_date === todayKey && (
                        <span className="chip chip-today">Today</span>
                      )}
                    </div>
                    <div className="holiday-reason">{holiday.reason}</div>
                    <button
                      type="button"
                      className="danger-btn small-btn"
                      onClick={() => handleDelete(holiday)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {past.length > 0 && (
            <details className="card past-holidays">
              <summary>Past holidays ({past.length})</summary>
              <ul className="holiday-list">
                {past.map((holiday) => (
                  <li key={holiday.id} className="holiday-item holiday-past">
                    <div className="holiday-date">
                      <strong>{formatLongDate(holiday.holiday_date)}</strong>
                    </div>
                    <div className="holiday-reason">{holiday.reason}</div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </>
  );
}
