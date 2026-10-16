import React, { useEffect, useState } from "react";
import { createBooking } from "../api/bookings";
import { formatLongDate } from "../utils/dates";

const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

const initialForm = {
  booking_date: "",
  period_no: "",
  room_name: "",
  booked_by: "",
  purpose: "",
};

export default function BookingForm({
  onBooked,
  selectedSlot,
  weekDates,
  holidayMap = {},
  isAdmin = false,
  token = "",
}) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!selectedSlot) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      booking_date: selectedSlot.booking_date,
      period_no: selectedSlot.period_no,
      room_name: selectedSlot.room_name,
    }));
  }, [selectedSlot]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSubmitting(true);

      const res = await createBooking(
        {
          booking_date: form.booking_date,
          period_no: Number(form.period_no),
          room_name: form.room_name,
          booked_by: form.booked_by,
          purpose: form.purpose,
        },
        isAdmin ? token : undefined
      );

      onBooked(res.data);
      setSuccess("Booking created successfully");
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Book a slot</h2>
          <p className="helper-text">
            {isAdmin
              ? "As an admin you can book today as well as upcoming school days."
              : "Pick a free slot in the table below, or choose the details here. Only upcoming school days can be booked."}
          </p>
        </div>
      </div>

      {selectedSlot && (
        <div className="selected-slot-banner">
          Selected: {formatLongDate(selectedSlot.booking_date)} · Period {selectedSlot.period_no} ·{" "}
          {selectedSlot.room_name}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <form className="booking-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Date</span>
          <select
            value={form.booking_date}
            onChange={(e) => handleChange("booking_date", e.target.value)}
            disabled={submitting}
          >
            <option value="">Select date</option>
            {weekDates.map((day) => {
              const holiday = holidayMap[day.booking_date];

              return (
                <option key={day.booking_date} value={day.booking_date} disabled={Boolean(holiday)}>
                  {day.label}
                  {day.is_today ? " (Today)" : ""}
                  {holiday ? ` — Holiday: ${holiday.reason}` : ""}
                </option>
              );
            })}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Period</span>
          <select
            value={form.period_no}
            onChange={(e) => handleChange("period_no", e.target.value)}
            disabled={submitting}
          >
            <option value="">Select period</option>
            {periods.map((period) => (
              <option key={period} value={period}>
                Period {period}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Room</span>
          <select
            value={form.room_name}
            onChange={(e) => handleChange("room_name", e.target.value)}
            disabled={submitting}
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Booked by</span>
          <input
            placeholder="Teacher name"
            value={form.booked_by}
            maxLength={100}
            onChange={(e) => handleChange("booked_by", e.target.value)}
            disabled={submitting}
          />
        </label>

        <label className="field field-wide">
          <span className="field-label">Purpose</span>
          <input
            placeholder="e.g. Science presentation, Class 9B"
            value={form.purpose}
            maxLength={200}
            onChange={(e) => handleChange("purpose", e.target.value)}
            disabled={submitting}
          />
        </label>

        <div className="field field-action">
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Booking..." : "Book slot"}
          </button>
        </div>
      </form>
    </div>
  );
}
