import React, { useEffect, useState } from "react";
import { getHistory } from "../api/bookings";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formatLongDate, normalizeDate } from "../utils/dates";

function formatData(data) {
  if (!data) {
    return null;
  }

  // Holiday records
  if (data.holiday_date) {
    return [
      { label: "Date", value: formatLongDate(normalizeDate(data.holiday_date)) },
      { label: "Reason", value: data.reason || "-" },
    ];
  }

  // Booking records
  return [
    { label: "Date", value: data.booking_date ? formatLongDate(normalizeDate(data.booking_date)) : data.day_name || "-" },
    { label: "Period", value: data.period_no ? `Period ${data.period_no}` : "-" },
    { label: "Room", value: data.room_name || "-" },
    { label: "Booked by", value: data.booked_by || "-" },
    { label: "Purpose", value: data.purpose || "-" },
  ];
}

const ACTIONS = {
  create: { label: "Created", className: "create" },
  update: { label: "Updated", className: "update" },
  delete: { label: "Deleted", className: "delete" },
  holiday_add: { label: "Holiday added", className: "holiday" },
  holiday_remove: { label: "Holiday removed", className: "holiday" },
};

const getAction = (action) =>
  ACTIONS[action?.toLowerCase()] || { label: action || "-", className: "" };

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token, isAdmin } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getHistory(token);
        setHistory(res.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin && token) {
      fetchHistory();
    }
  }, [isAdmin, token]);

  return (
    <>
      <PageHeader
        kicker="Admin"
        title="Booking history"
        subtitle="Audit trail of every booking and holiday change."
      />

      {loading ? (
        <div className="card">
          <p className="info-text">Loading booking history...</p>
        </div>
      ) : error ? (
        <div className="card">
          <p className="error-text">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">No booking history found yet.</div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const oldData = formatData(item.old_data);
            const newData = formatData(item.new_data);
            const action = getAction(item.action);
            const isHolidayAction = item.action?.toUpperCase().startsWith("HOLIDAY");

            return (
              <div key={item.id} className="history-card">
                <div className="history-top">
                  <span className={`history-badge ${action.className}`}>{action.label}</span>

                  <div className="history-meta">
                    {!isHolidayAction && `Booking #${item.booking_id || "-"} · `}
                    {item.changed_by || "system"} · {new Date(item.changed_at).toLocaleString()}
                  </div>
                </div>

                <div className="history-grid">
                  {oldData && (
                    <div className="history-block">
                      <h4>Before</h4>
                      {oldData.map((row) => (
                        <p key={row.label} className="history-line">
                          <strong>{row.label}:</strong> {row.value}
                        </p>
                      ))}
                    </div>
                  )}

                  {newData && (
                    <div className="history-block">
                      <h4>After</h4>
                      {newData.map((row) => (
                        <p key={row.label} className="history-line">
                          <strong>{row.label}:</strong> {row.value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
