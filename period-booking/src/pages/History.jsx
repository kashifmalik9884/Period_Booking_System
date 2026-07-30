import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

function formatBookingData(data) {
  if (!data) {
    return null;
  }

  return [
    { label: "Day", value: data.day_name || "-" },
    { label: "Period", value: data.period_no ? `Period ${data.period_no}` : "-" },
    { label: "Room", value: data.room_name || "-" },
    { label: "Booked By", value: data.booked_by || "-" },
    { label: "Purpose", value: data.purpose || "-" },
  ];
}

function getActionClass(action) {
  const value = action?.toLowerCase();

  if (value === "create") return "create";
  if (value === "update") return "update";
  if (value === "delete") return "delete";
  return "";
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token, admin, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getHistory(token);
        setHistory(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin && token) {
      fetchHistory();
    }
  }, [isAdmin, token]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h2>Booking History</h2>
          <p className="page-subtitle">
            Admin-only audit trail of create, update, and delete actions.
          </p>
        </div>

        <div className="header-actions">
          {admin && <span className="admin-badge">Admin: {admin.username}</span>}
          <button className="secondary-btn" onClick={() => navigate("/bookings")}>
            Active Bookings
          </button>
          <button className="secondary-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
          <button className="danger-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

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
            const oldData = formatBookingData(item.old_data);
            const newData = formatBookingData(item.new_data);

            return (
              <div key={item.id} className="history-card">
                <div className="history-top">
                  <div>
                    <span className={`history-badge ${getActionClass(item.action)}`}>
                      {item.action}
                    </span>
                  </div>

                  <div className="history-meta">
                    Booking ID {item.booking_id || "-"} • {item.changed_by || "system"} •{" "}
                    {new Date(item.changed_at).toLocaleString()}
                  </div>
                </div>

                <div className="history-grid">
                  {oldData && (
                    <div className="history-block">
                      <h4>Old Data</h4>
                      {oldData.map((row) => (
                        <p key={row.label} className="history-line">
                          <strong>{row.label}:</strong> {row.value}
                        </p>
                      ))}
                    </div>
                  )}

                  {newData && (
                    <div className="history-block">
                      <h4>New Data</h4>
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
    </div>
  );
}