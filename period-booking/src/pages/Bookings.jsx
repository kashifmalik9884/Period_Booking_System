import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteBooking, getBookings, getHolidays } from "../api/bookings";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formatLongDate, getTodayKey, normalizeDate } from "../utils/dates";

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [holidayMap, setHolidayMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const todayKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [bookingResponse, holidayResponse] = await Promise.all([
          getBookings(),
          getHolidays().catch(() => ({ data: [] })),
        ]);

        // Today is included because admins can book it.
        const active = bookingResponse.data
          .map((booking) => ({ ...booking, booking_date: normalizeDate(booking.booking_date) }))
          .filter((booking) => booking.booking_date >= todayKey)
          .sort((a, b) => {
            if (a.booking_date !== b.booking_date) {
              return a.booking_date.localeCompare(b.booking_date);
            }

            if (Number(a.period_no) !== Number(b.period_no)) {
              return Number(a.period_no) - Number(b.period_no);
            }

            return a.room_name.localeCompare(b.room_name);
          });

        setBookings(active);
        setHolidayMap(
          Object.fromEntries(
            holidayResponse.data.map((holiday) => [normalizeDate(holiday.holiday_date), holiday])
          )
        );
      } catch (requestError) {
        setError("Failed to load active bookings");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      load();
    }
  }, [isAdmin, todayKey]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this booking?");

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      await deleteBooking(id, token);
      setBookings((previous) => previous.filter((booking) => booking.id !== id));
      setMessage("Booking deleted successfully");
    } catch (requestError) {
      setMessage(requestError.response?.data?.message || "Failed to delete booking");
    }
  };

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Active bookings"
        subtitle="Today's and upcoming bookings. Edit or delete them here."
      />

      {message && (
        <p className={message.toLowerCase().includes("failed") ? "error-text" : "success-text"}>
          {message}
        </p>
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
          {bookings.map((booking) => {
            const holiday = holidayMap[booking.booking_date];

            return (
              <div key={booking.id} className="booking-list-card">
                <div className="booking-list-top">
                  <div>
                    <div className="booking-chips">
                      <span className="chip chip-room">{booking.room_name}</span>
                      {booking.booking_date === todayKey && (
                        <span className="chip chip-today">Today</span>
                      )}
                      {holiday && (
                        <span className="chip chip-holiday">Holiday: {holiday.reason}</span>
                      )}
                    </div>

                    <h3 className="booking-title">
                      {formatLongDate(booking.booking_date)} · Period {booking.period_no}
                    </h3>
                  </div>

                  <span className="booking-id-badge">#{booking.id}</span>
                </div>

                {holiday && (
                  <p className="warning-text">
                    This day is now a holiday, so this booking is hidden from the booking table.
                    Delete it or move it to another date.
                  </p>
                )}

                <div className="booking-info-grid">
                  <div className="booking-info-block">
                    <span className="booking-info-label">Booked by</span>
                    <span className="booking-info-value">{booking.booked_by}</span>
                  </div>

                  <div className="booking-info-block">
                    <span className="booking-info-label">Purpose</span>
                    <span className="booking-info-value">{booking.purpose}</span>
                  </div>

                  <div className="booking-info-block">
                    <span className="booking-info-label">Created</span>
                    <span className="booking-info-value">{formatDateTime(booking.created_at)}</span>
                  </div>

                  <div className="booking-info-block">
                    <span className="booking-info-label">Updated</span>
                    <span className="booking-info-value">{formatDateTime(booking.updated_at)}</span>
                  </div>
                </div>

                <div className="booking-list-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => navigate(`/edit/${booking.id}`)}
                  >
                    Edit booking
                  </button>

                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => handleDelete(booking.id)}
                  >
                    Delete booking
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
