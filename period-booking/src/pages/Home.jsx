import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings } from "../api/bookings";
import BookingForm from "../components/BookingForm";
import BookingTable from "../components/BookingTable";
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

const getUpcomingSchoolDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];
  const cursor = new Date(today);

  while (result.length < 6) {
    cursor.setDate(cursor.getDate() + 1);

    const dayNumber = cursor.getDay();

    if (dayNumber >= 1 && dayNumber <= 6) {
      result.push({
        booking_date: formatDateForInput(cursor),
        day_name: cursor.toLocaleDateString("en-GB", {
          weekday: "long",
        }),
        label: cursor.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });
    }
  }

  return result;
};

export default function Home() {
  const [bookings, setBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { admin, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const weekDates = useMemo(() => getUpcomingSchoolDays(), []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBookings();

      const normalizedBookings = response.data.map((booking) => ({
        ...booking,
        booking_date: normalizeBookingDate(booking.booking_date),
      }));

      const allowedDates = new Set(
        weekDates.map((day) => day.booking_date)
      );

      const futureBookings = normalizedBookings.filter((booking) =>
        allowedDates.has(booking.booking_date)
      );

      setBookings(futureBookings);
    } catch (requestError) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleBooked = (newBooking) => {
    const normalizedBooking = {
      ...newBooking,
      booking_date: normalizeBookingDate(newBooking.booking_date),
    };

    const allowedDates = new Set(
      weekDates.map((day) => day.booking_date)
    );

    if (allowedDates.has(normalizedBooking.booking_date)) {
      setBookings((previousBookings) => [
        normalizedBooking,
        ...previousBookings,
      ]);
    }

    setSelectedSlot(null);
  };

  const handleEdit = (booking) => {
    if (!isAdmin) {
      return;
    }

    navigate(`/edit/${booking.id}`);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="section-kicker">School AV scheduling</span>

          <h1>Period Booking System</h1>

          <p className="page-subtitle">
            Book an available room and period for an upcoming school day.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/today")}
          >
            Today&apos;s Availability
          </button>

          {isAdmin ? (
            <>
              <span className="admin-badge">
                Admin: {admin?.username || "Administrator"}
              </span>

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
          ) : (
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

      <BookingForm
        onBooked={handleBooked}
        selectedSlot={selectedSlot}
        weekDates={weekDates}
      />

      <div className="section-spacing">
        {loading ? (
          <div className="card">
            <p className="info-text">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="card">
            <p className="error-text">{error}</p>
          </div>
        ) : (
          <BookingTable
            bookings={bookings}
            weekDates={weekDates}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onSlotSelect={handleSlotSelect}
            selectedSlot={selectedSlot}
          />
        )}
      </div>
    </div>
  );
}
