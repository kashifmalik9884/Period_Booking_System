import React from "react";
import { formatShortDate, formatWeekday, normalizeDate } from "../utils/dates";

const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

export default function BookingTable({
  bookings,
  weekDates,
  holidayMap = {},
  isAdmin,
  onEdit,
  onSlotSelect,
  selectedSlot,
}) {
  const getSlot = (bookingDate, period, room) =>
    bookings.find(
      (booking) =>
        normalizeDate(booking.booking_date) === bookingDate &&
        Number(booking.period_no) === Number(period) &&
        booking.room_name === room
    );

  const isSelected = (bookingDate, period, room) =>
    selectedSlot &&
    normalizeDate(selectedSlot.booking_date) === bookingDate &&
    Number(selectedSlot.period_no) === Number(period) &&
    selectedSlot.room_name === room;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Booking table</h2>
          <p className="helper-text">
            Click a free slot to fill in the form above. Holidays are closed for booking.
          </p>
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot dot-ok" />
            Available
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-bad" />
            Booked
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-hol" />
            Holiday
          </span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="booking-table">
          <thead>
            <tr>
              <th className="corner-cell">Period</th>
              {weekDates.map((day) => {
                const holiday = holidayMap[day.booking_date];

                return (
                  <th
                    key={day.booking_date}
                    className={`${day.is_today ? "is-today" : ""} ${holiday ? "is-holiday" : ""}`}
                  >
                    <div className="th-day">{formatWeekday(day.booking_date)}</div>
                    <div className="table-date-label">{formatShortDate(day.booking_date)}</div>
                    {day.is_today && <span className="chip chip-today">Today</span>}
                    {holiday && <span className="chip chip-holiday">Holiday</span>}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {periods.map((period) => (
              <tr key={period}>
                <td className="period-cell">Period {period}</td>

                {weekDates.map((day) => {
                  const holiday = holidayMap[day.booking_date];

                  return (
                    <td key={day.booking_date}>
                      <div className="day-room-stack">
                        {rooms.map((room) => {
                          if (holiday) {
                            return (
                              <div key={room} className="slot-card holiday">
                                <div className="slot-head">
                                  <span className="room-name">{room}</span>
                                  <span className="slot-status status-holiday">Holiday</span>
                                </div>
                                <div className="slot-detail slot-reason">{holiday.reason}</div>
                              </div>
                            );
                          }

                          const slot = getSlot(day.booking_date, period, room);
                          const selected = isSelected(day.booking_date, period, room);

                          return (
                            <div
                              key={room}
                              className={`slot-card ${slot ? "booked" : "available slot-clickable"} ${selected ? "slot-selected" : ""}`}
                              onClick={() => {
                                if (!slot && onSlotSelect) {
                                  onSlotSelect({
                                    booking_date: day.booking_date,
                                    day_name: day.day_name,
                                    period_no: period,
                                    room_name: room,
                                  });
                                }
                              }}
                            >
                              <div className="slot-head">
                                <span className="room-name">{room}</span>
                                <span className={`slot-status ${slot ? "status-booked" : "status-available"}`}>
                                  {slot ? "Booked" : "Available"}
                                </span>
                              </div>

                              {slot ? (
                                <>
                                  <div className="slot-detail">
                                    <strong>By:</strong> {slot.booked_by}
                                  </div>
                                  <div className="slot-detail slot-purpose">
                                    <strong>For:</strong> {slot.purpose}
                                  </div>

                                  {isAdmin && (
                                    <div className="slot-actions">
                                      <button
                                        type="button"
                                        className="secondary-btn small-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEdit(slot);
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="slot-detail slot-free">Free for this period</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
