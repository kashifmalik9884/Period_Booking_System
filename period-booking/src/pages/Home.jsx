import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBookings, getHolidays } from "../api/bookings";
import BookingForm from "../components/BookingForm";
import BookingTable from "../components/BookingTable";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { getSchoolDays, normalizeDate } from "../utils/dates";

const SLOTS_PER_DAY = 14; // 7 periods x 2 rooms

export default function Home() {
  const [bookings, setBookings] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Admins can also see and book today.
  const weekDates = useMemo(() => getSchoolDays({ count: 6, includeToday: isAdmin }), [isAdmin]);

  const holidayMap = useMemo(
    () =>
      Object.fromEntries(
        holidays.map((holiday) => [normalizeDate(holiday.holiday_date), holiday])
      ),
    [holidays]
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingResponse, holidayResponse] = await Promise.all([
        getBookings(),
        // A holidays failure should not take the whole page down.
        getHolidays().catch(() => ({ data: [] })),
      ]);

      setBookings(
        bookingResponse.data.map((booking) => ({
          ...booking,
          booking_date: normalizeDate(booking.booking_date),
        }))
      );
      setHolidays(holidayResponse.data);
    } catch (requestError) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Arriving from the Today page with a slot chosen by an admin.
  useEffect(() => {
    if (location.state?.slot) {
      setSelectedSlot(location.state.slot);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const stats = useMemo(() => {
    const openDates = new Set(
      weekDates.filter((day) => !holidayMap[day.booking_date]).map((day) => day.booking_date)
    );

    const total = openDates.size * SLOTS_PER_DAY;
    const booked = bookings.filter((booking) => openDates.has(booking.booking_date)).length;

    return {
      total,
      booked,
      open: Math.max(total - booked, 0),
      holidays: weekDates.length - openDates.size,
    };
  }, [bookings, weekDates, holidayMap]);

  const handleBooked = (newBooking) => {
    setBookings((previous) => [
      { ...newBooking, booking_date: normalizeDate(newBooking.booking_date) },
      ...previous,
    ]);
    setSelectedSlot(null);
  };

  const handleEdit = (booking) => {
    if (isAdmin) {
      navigate(`/edit/${booking.id}`);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHeader
        kicker="School AV scheduling"
        title="Book an AV room"
        subtitle="Reserve one of the two AV rooms for a period on an upcoming school day."
      />

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Open slots</span>
          <span className="stat-value stat-ok">{stats.open}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Booked</span>
          <span className="stat-value stat-bad">{stats.booked}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Holidays in view</span>
          <span className="stat-value stat-hol">{stats.holidays}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Days shown</span>
          <span className="stat-value">{weekDates.length}</span>
        </div>
      </div>

      <BookingForm
        onBooked={handleBooked}
        selectedSlot={selectedSlot}
        weekDates={weekDates}
        holidayMap={holidayMap}
        isAdmin={isAdmin}
        token={token}
      />

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
          holidayMap={holidayMap}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onSlotSelect={handleSlotSelect}
          selectedSlot={selectedSlot}
        />
      )}
    </>
  );
}
