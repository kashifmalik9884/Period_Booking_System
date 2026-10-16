import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteBooking, getBookings, updateBooking } from "../api/bookings";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formatWeekday, getTodayKey, normalizeDate } from "../utils/dates";

const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    booking_date: "",
    period_no: 1,
    room_name: "AV Room 1",
    booked_by: "",
    purpose: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const todayKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await getBookings();
        const booking = res.data.find((item) => String(item.id) === String(id));

        if (!booking) {
          setError("Booking not found");
          return;
        }

        setForm({
          booking_date: normalizeDate(booking.booking_date),
          period_no: Number(booking.period_no),
          room_name: booking.room_name,
          booked_by: booking.booked_by,
          purpose: booking.purpose,
        });
      } catch (requestError) {
        setError("Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "period_no" ? Number(value) : value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);
      await updateBooking(id, form, token);
      setSuccess("Booking updated successfully");

      setTimeout(() => {
        navigate("/bookings");
      }, 800);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this booking?");

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      await deleteBooking(id, token);
      navigate("/bookings");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete booking");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p className="info-text">Loading booking details...</p>
      </div>
    );
  }

  const busy = saving || deleting;

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Edit booking"
        subtitle="Update the details or delete the booking permanently."
      >
        <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </PageHeader>

      <div className="card">
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <form className="edit-form" onSubmit={handleUpdate}>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">
                Date{form.booking_date ? ` · ${formatWeekday(form.booking_date)}` : ""}
              </span>
              <input
                type="date"
                name="booking_date"
                min={todayKey}
                value={form.booking_date}
                onChange={handleChange}
                disabled={busy}
              />
            </label>

            <label className="field">
              <span className="field-label">Period</span>
              <select name="period_no" value={form.period_no} onChange={handleChange} disabled={busy}>
                {periods.map((period) => (
                  <option key={period} value={period}>
                    Period {period}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Room</span>
              <select name="room_name" value={form.room_name} onChange={handleChange} disabled={busy}>
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
                name="booked_by"
                value={form.booked_by}
                maxLength={100}
                onChange={handleChange}
                disabled={busy}
                placeholder="Booked by"
              />
            </label>

            <label className="field full-width">
              <span className="field-label">Purpose</span>
              <textarea
                name="purpose"
                value={form.purpose}
                maxLength={200}
                onChange={handleChange}
                disabled={busy}
                placeholder="Enter purpose"
                rows="4"
              />
            </label>
          </div>

          <div className="page-actions">
            <button type="submit" className="primary-btn" disabled={busy}>
              {saving ? "Saving..." : "Update booking"}
            </button>

            <button type="button" className="danger-btn" onClick={handleDelete} disabled={busy}>
              {deleting ? "Deleting..." : "Delete booking"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
