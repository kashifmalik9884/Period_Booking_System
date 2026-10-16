import React from "react";
import { normalizeDate } from "../utils/dates";

const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

// `closed` is { type: "holiday" | "sunday", reason } when no bookings can happen today.
export default function TodayAvailability({
  bookings = [],
  dateKey,
  label,
  closed = null,
  isAdmin = false,
  onEdit,
  onBook,
}) {
  const todayBookings = bookings.filter(
    (booking) => normalizeDate(booking.booking_date) === dateKey
  );

  const getBooking = (period, room) =>
    todayBookings.find(
      (booking) => Number(booking.period_no) === Number(period) && booking.room_name === room
    );

  const totalSlots = periods.length * rooms.length;
  const vacantCount = closed ? 0 : totalSlots - todayBookings.length;

  return (
    <section className="today-card card">
      <div className="card-head">
        <div>
          <span className="section-kicker">Live room status</span>
          <h2>{label}</h2>
        </div>

        {!closed && (
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot dot-bad" />
              Booked
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-ok" />
              Vacant ({vacantCount})
            </span>
          </div>
        )}
      </div>

      {closed && (
        <div className={`closed-banner closed-${closed.type}`}>
          <strong>{closed.type === "holiday" ? "Holiday" : "School closed"}</strong>
          <span>{closed.reason}</span>
        </div>
      )}

      <div className="table-wrap">
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
                  if (closed) {
                    return (
                      <td key={room}>
                        <div className="today-slot today-slot-holiday">
                          <div className="today-slot-status">
                            {closed.type === "holiday" ? "Holiday" : "Closed"}
                          </div>
                          <div className="today-muted">{closed.reason}</div>
                        </div>
                      </td>
                    );
                  }

                  const booking = getBooking(period, room);

                  return (
                    <td key={room}>
                      {booking ? (
                        <div className="today-slot today-slot-booked">
                          <div className="today-slot-status">Booked</div>

                          <div className="today-booked-by">
                            <span>Booked by</span>
                            <strong>{booking.booked_by || "Unknown user"}</strong>
                          </div>

                          {booking.purpose && <div className="today-muted">{booking.purpose}</div>}

                          {isAdmin && (
                            <button
                              type="button"
                              className="secondary-btn small-btn"
                              onClick={() => onEdit(booking)}
                            >
                              Edit booking
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="today-slot today-slot-vacant">
                          <div className="today-slot-status">Vacant</div>
                          <div className="today-muted">Available for this period</div>

                          {isAdmin && onBook && (
                            <button
                              type="button"
                              className="primary-btn small-btn"
                              onClick={() => onBook({ period_no: period, room_name: room })}
                            >
                              Book this slot
                            </button>
                          )}
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

      {!closed && todayBookings.length === 0 && (
        <div className="today-empty-message">
          No bookings have been recorded for today. All AV room periods are vacant.
        </div>
      )}
    </section>
  );
}
