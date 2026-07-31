import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings, deleteBooking } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDateString = () => {
  return formatDateForInput(new Date());
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

const formatDateTime = (value) => {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { token, admin, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const todayDate = useMemo(() => getTodayDateString(), []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getBookings();

      const upcomingBookings = res.data
        .filter((booking) => booking.booking_date > todayDate)
        .sort((a, b) => {
          if (a.booking_date !== b.booking_date) {
            return a.booking_date.localeCompare(b.booking_date);
          }

          if (Number(a.period_no) !== Number(b.period_no)) {
            return Number(a.period_no) - Number(b.period_no);
          }

          return a.room_name.localeCompare(b.room_name);
        });

      setBookings(upcomingBookings);
    } catch (error) {
      setError("Failed to load active bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
                  <div className="booking-chip">
                    {booking.room_name}
                  </div>

                  <h3 className="booking-title">
                    {formatDisplayDate(booking.booking_date)} • Period {booking.period_no}
                  </h3>

                  <p className="booking-subtitle">
                    Current active booking record
                  </p>
                </div>

                <div className="booking-id-badge">
                  Booking ID #{booking.id}
                </div>
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
                  <span className="booking-info-value">{formatDateTime(booking.created_at)}</span>
                </div>

                <div className="booking-info-block">
                  <span className="booking-info-label">Updated At</span>
                  <span className="booking-info-value">{formatDateTime(booking.updated_at)}</span>
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
