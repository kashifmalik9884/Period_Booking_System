import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings, deleteBooking } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { token, admin, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getBookings();
        setBookings(res.data);
      } catch (error) {
        setError("Failed to load active bookings");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadBookings();
    }
  }, [isAdmin]);

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      await deleteBooking(id, token);
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      setMessage("Booking deleted successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete booking");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2>Active Bookings</h2>
          <p className="page-subtitle">
            Admin-only page for editing and deleting current bookings.
          </p>
        </div>

        <div className="header-actions">
          {admin && <span className="admin-badge">Admin: {admin.username}</span>}
          <button className="secondary-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
          <button className="secondary-btn" onClick={() => navigate("/history")}>
            View History
          </button>
          <button className="danger-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className="card">
          <p className={message.toLowerCase().includes("failed") ? "error-text" : "success-text"}>
            {message}
          </p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <p className="info-text">Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="card">
          <p className="error-text">{error}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No active bookings found.</div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-list-card">
              <div className="booking-list-top">
                <div>
                  <h3>
                    {booking.day_name} • Period {booking.period_no}
                  </h3>
                  <p className="helper-text">{booking.room_name}</p>
                </div>

                <div className="booking-meta">Booking ID {booking.id}</div>
              </div>

              <div className="booking-info-grid">
                <div className="booking-info-block">
                  <span className="booking-info-label">Booked By</span>
                  <span className="booking-info-value">{booking.booked_by}</span>
                </div>

                <div className="booking-info-block">
                  <span className="booking-info-label">Purpose</span>
                  <span className="booking-info-value">{booking.purpose}</span>
                </div>

                <div className="booking-info-block">
                  <span className="booking-info-label">Created At</span>
                  <span className="booking-info-value">
                    {new Date(booking.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="booking-info-block">
                  <span className="booking-info-label">Updated At</span>
                  <span className="booking-info-value">
                    {new Date(booking.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="booking-list-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => handleEdit(booking.id)}
                >
                  Edit Booking
                </button>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={() => handleDelete(booking.id)}
                >
                  Delete Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}