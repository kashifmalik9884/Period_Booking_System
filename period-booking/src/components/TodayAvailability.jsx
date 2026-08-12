import React from "react";

const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

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

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateForInput(value);
  }

  return "";
};

const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    key: formatDateForInput(today),
    label: today.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
};

export default function TodayAvailability({
  bookings = [],
  isAdmin = false,
  onEdit,
}) {
  const today = getTodayDate();

  const todayBookings = bookings.filter(
    (booking) => normalizeBookingDate(booking.booking_date) === today.key
  );

  const getBooking = (period, room) => {
    return todayBookings.find(
      (booking) =>
        Number(booking.period_no) === Number(period) &&
        booking.room_name === room
    );
  };

  return (
    <section className="today-availability card">
      <div className="today-availability-header">
        <div>
          <span className="section-kicker">Live room status</span>
          <h2>Today&apos;s AV Room Availability</h2>
          <p className="helper-text">{today.label}</p>
        </div>

        <div className="availability-summary">
          <span className="summary-item booked-summary">
            <span className="summary-dot" />
            Booked
          </span>

          <span className="summary-item vacant-summary">
            <span className="summary-dot" />
            Vacant
          </span>
        </div>
      </div>

      <div className="today-table-wrap">
        <table className="today-table">
          <thead>
            <tr>
              <th>Period</th>
              {rooms.map((room) => (
                <th key={room}>{room}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {periods.map((period) => (
              <tr key={period}>
                <td className="today-period-cell">Period {period}</td>

                {rooms.map((room) => {
                  const booking = getBooking(period, room);

                  return (
                    <td key={room}>
                      {booking ? (
                        <div className="today-slot today-slot-booked">
                          <div className="today-slot-status booked-state">
                            <span className="status-icon status-icon-booked">✕</span>
                            <span>Booked</span>
                          </div>

                          <div className="today-booked-by">
                            <span>Booked by</span>
                            <strong>{booking.booked_by || "Unknown user"}</strong>
                          </div>

                          {booking.purpose && (
                            <div className="today-purpose">{booking.purpose}</div>
                          )}

                          {isAdmin && (
                            <button
                              type="button"
                              className="primary-btn today-edit-btn"
                              onClick={() => onEdit(booking)}
                            >
                              Edit Booking
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="today-slot today-slot-vacant">
                          <div className="today-slot-status vacant-state">
                            <span className="status-icon status-icon-vacant">✓</span>
                            <span>Vacant</span>
                          </div>

                          <div className="today-vacant-text">
                            Available for this period
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {todayBookings.length === 0 && (
        <div className="today-empty-message">
          No bookings have been recorded for today. All AV room periods are vacant.
        </div>
      )}
    </section>
  );
}
