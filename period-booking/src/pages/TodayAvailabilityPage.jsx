import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings } from "../api/bookings";
import TodayAvailability from "../components/TodayAvailability";
import { useAuth } from "../context/AuthContext";

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeBookingDate = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateForInput(value);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return formatDateForInput(parsedDate);
};

export default function TodayAvailabilityPage() {
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { admin, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const todayDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return formatDateForInput(today);
  }, []);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const loadTodayBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBookings();

      const normalizedBookings = response.data.map((booking) => ({
        ...booking,
        booking_date: normalizeBookingDate(booking.booking_date),
      }));

      const currentDayBookings = normalizedBookings.filter(
        (booking) => booking.booking_date === todayDate
      );

      setTodayBookings(currentDayBookings);
    } catch (requestError) {
      setError("Failed to load today’s room availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayBookings();
  }, []);

  const handleEdit = (booking) => {
    if (!isAdmin) {
      return;
    }

    navigate(`/edit/${booking.id}`);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="section-kicker">Daily room schedule</span>

          <h1>Today&apos;s AV Room Availability</h1>

          <p className="page-subtitle">{todayLabel}</p>
        </div>

        <div className="header-actions">
          {isAdmin && (
            <span className="admin-badge">
              Admin: {admin?.username || "Administrator"}
            </span>
          )}

          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/")}
          >
            Back to Booking
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/bookings")}
              >
                Active Bookings
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/history")}
              >
                View History
              </button>

              <button
                type="button"
                className="danger-btn"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}

          {!isAdmin && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/admin")}
            >
              Admin Login
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card">
          <p className="info-text">
            Loading today&apos;s availability...
          </p>
        </div>
      ) : error ? (
        <div className="card">
          <p className="error-text">{error}</p>
        </div>
      ) : (
        <TodayAvailability
          bookings={todayBookings}
          isAdmin={isAdmin}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
