import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookings, updateBooking, deleteBooking } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

export default function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, admin, logout } = useAuth();

  const [form, setForm] = useState({
    day_name: "Monday",
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
          day_name: booking.day_name,
          period_no: Number(booking.period_no),
          room_name: booking.room_name,
          booked_by: booking.booked_by,
          purpose: booking.purpose,
        });
      } catch (error) {
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
        navigate("/");
      }, 800);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update booking");
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
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete booking");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="card">
          <p className="info-text">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2>Edit Booking</h2>
          <p className="page-subtitle">
            Admin can update booking details or delete the booking permanently.
          </p>
        </div>

        <div className="header-actions">
          {admin && <span className="admin-badge">Admin: {admin.username}</span>}
          <button className="secondary-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
          <button className="danger-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <form className="edit-form" onSubmit={handleUpdate}>
          <div className="form-grid">
            <div>
              <label className="field-label">Day</label>
              <select
                name="day_name"
                value={form.day_name}
                onChange={handleChange}
                disabled={saving || deleting}
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Period</label>
              <select
                name="period_no"
                value={form.period_no}
                onChange={handleChange}
                disabled={saving || deleting}
              >
                {periods.map((period) => (
                  <option key={period} value={period}>
                    Period {period}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Room</label>
              <select
                name="room_name"
                value={form.room_name}
                onChange={handleChange}
                disabled={saving || deleting}
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Booked By</label>
              <input
                name="booked_by"
                value={form.booked_by}
                onChange={handleChange}
                disabled={saving || deleting}
                placeholder="Booked by"
              />
            </div>

            <div className="full-width">
              <label className="field-label">Purpose</label>
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                disabled={saving || deleting}
                placeholder="Enter purpose"
                rows="4"
              />
            </div>
          </div>

          <div className="page-actions">
            <button type="submit" className="primary-btn" disabled={saving || deleting}>
              {saving ? "Saving..." : "Update Booking"}
            </button>

            <button
              type="button"
              className="danger-btn"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? "Deleting..." : "Delete Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}