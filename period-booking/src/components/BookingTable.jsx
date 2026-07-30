import React from "react";

const periods = [1, 2, 3, 4, 5, 6, 7];
const rooms = ["AV Room 1", "AV Room 2"];

const formatHeaderLabel = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);

  return {
    day: date.toLocaleDateString("en-GB", { weekday: "long" }),
    shortDate: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
  };
};

export default function BookingTable({
  bookings,
  weekDates,
  isAdmin,
  onEdit,
  onSlotSelect,
  selectedSlot,
}) {
  const getSlot = (bookingDate, period, room) =>
    bookings.find(
      (booking) =>
        booking.booking_date === bookingDate &&
        Number(booking.period_no) === Number(period) &&
        booking.room_name === room
    );

  const isSelected = (bookingDate, period, room) =>
    selectedSlot &&
    selectedSlot.booking_date === bookingDate &&
    Number(selectedSlot.period_no) === Number(period) &&
    selectedSlot.room_name === room;

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <h2>Booking Table</h2>
          <p className="helper-text">
            Only upcoming future school dates are shown here.
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Period</th>
              {weekDates.map((day) => {
                const header = formatHeaderLabel(day.booking_date);

                return (
                  <th key={day.booking_date}>
                    <div>{header.day}</div>
                    <div className="table-date-label">{header.shortDate}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {periods.map((period) => (
              <tr key={period}>
                <td className="period-cell">Period {period}</td>

                {weekDates.map((day) => (
                  <td key={day.booking_date}>
                    <div className="day-room-stack">
                      {rooms.map((room) => {
                        const slot = getSlot(day.booking_date, period, room);
                        const selected = isSelected(day.booking_date, period, room);

                        return (
                          <div
                            key={room}
                            className={`slot-card ${slot ? "booked" : "available"} ${selected ? "slot-selected" : ""} ${!slot ? "slot-clickable" : ""}`}
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
                                {slot ? "✕ Booked" : "Available"}
                              </span>
                            </div>

                            {slot ? (
                              <>
                                <div className="slot-detail">
                                  <strong>Booked By:</strong> {slot.booked_by}
                                </div>
                                <div className="slot-detail">
                                  <strong>Purpose:</strong> {slot.purpose}
                                </div>

                                {isAdmin && (
                                  <div className="slot-actions">
                                    <button
                                      type="button"
                                      className="primary-btn small-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(slot);
                                      }}
                                    >
                                      Edit Booking
                                    </button>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="slot-detail">
                                This room is free for this period.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}