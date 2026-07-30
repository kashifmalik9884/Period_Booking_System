import React, { useEffect, useState } from "react";
import { createBooking } from "../api/bookings";

const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

const initialForm = {
  booking_date: "",
  period_no: "",
  room_name: "",
  booked_by: "",
  purpose: "",
};

const formatDisplayDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function BookingForm({ onBooked, selectedSlot, weekDates }) {
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

      const res = await createBooking({
        booking_date: form.booking_date,
        period_no: Number(form.period_no),
        room_name: form.room_name,
        booked_by: form.booked_by,
        purpose: form.purpose,
      });

      onBooked(res.data);
      setSuccess("Booking created successfully");
      setForm(initialForm);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Book a Slot</h2>

      <p className="info-text">
        Only future school dates are available for booking.
      </p>

      {selectedSlot && (
        <div className="selected-slot-banner">
          Selected: {formatDisplayDate(selectedSlot.booking_date)} • Period {selectedSlot.period_no} • {selectedSlot.room_name}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <form className="booking-form" onSubmit={handleSubmit}>
        <select
          value={form.booking_date}
          onChange={(e) => handleChange("booking_date", e.target.value)}
          disabled={submitting}
        >
          <option value="">Select date</option>
          {weekDates.map((day) => (
            <option key={day.booking_date} value={day.booking_date}>
              {day.label}
            </option>
          ))}
        </select>

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

        <input
          placeholder="Booked by"
          value={form.booked_by}
          onChange={(e) => handleChange("booked_by", e.target.value)}
          disabled={submitting}
        />

        <input
          placeholder="Purpose"
          value={form.purpose}
          onChange={(e) => handleChange("purpose", e.target.value)}
          disabled={submitting}
        />

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? "Booking..." : "Book Slot"}
        </button>
      </form>
    </div>
  );
}