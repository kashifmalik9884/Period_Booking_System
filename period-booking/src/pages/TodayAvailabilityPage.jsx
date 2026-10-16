import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings, getHolidays } from "../api/bookings";
import PageHeader from "../components/PageHeader";
import TodayAvailability from "../components/TodayAvailability";
import { useAuth } from "../context/AuthContext";
import {
  formatLongDate,
  formatWeekday,
  getTodayKey,
  isSunday,
  normalizeDate,
} from "../utils/dates";

export default function TodayAvailabilityPage() {
  const [bookings, setBookings] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isAdmin } = useAuth();
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

        setBookings(
          bookingResponse.data
            .map((booking) => ({ ...booking, booking_date: normalizeDate(booking.booking_date) }))
            .filter((booking) => booking.booking_date === todayKey)
        );
        setHolidays(holidayResponse.data);
      } catch (requestError) {
        setError("Failed to load today's room availability");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [todayKey]);

  const todayHoliday = holidays.find((holiday) => normalizeDate(holiday.holiday_date) === todayKey);

  let closed = null;

  if (todayHoliday) {
    closed = { type: "holiday", reason: todayHoliday.reason };
  } else if (isSunday(todayKey)) {
    closed = { type: "sunday", reason: "Sunday — no school today" };
  }

  const handleEdit = (booking) => {
    if (isAdmin) {
      navigate(`/edit/${booking.id}`);
    }
  };

  // Hand the chosen slot to the booking form on the home page.
  const handleBook = (slot) => {
    navigate("/", {
      state: {
        slot: {
          booking_date: todayKey,
          day_name: formatWeekday(todayKey),
          ...slot,
        },
      },
    });
  };

  return (
    <>
      <PageHeader
        kicker="Daily room schedule"
        title="Today's availability"
        subtitle={formatLongDate(todayKey)}
      />

      {loading ? (
        <div className="card">
          <p className="info-text">Loading today's availability...</p>
        </div>
      ) : error ? (
        <div className="card">
          <p className="error-text">{error}</p>
        </div>
      ) : (
        <TodayAvailability
          bookings={bookings}
          dateKey={todayKey}
          label={formatLongDate(todayKey)}
          closed={closed}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onBook={handleBook}
        />
      )}
    </>
  );
}
