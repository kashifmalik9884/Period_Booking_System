import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

export default function Layout() {
  const { admin, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand" onClick={close}>
            <span className="brand-mark">P</span>
            <span className="brand-text">Period Booking</span>
          </NavLink>

          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav${open ? " nav-open" : ""}`}>
            <NavLink to="/" end className={linkClass} onClick={close}>
              Book a slot
            </NavLink>
            <NavLink to="/today" className={linkClass} onClick={close}>
              Today
            </NavLink>

            {isAdmin && (
              <>
                <NavLink to="/bookings" className={linkClass} onClick={close}>
                  Active bookings
                </NavLink>
                <NavLink to="/holidays" className={linkClass} onClick={close}>
                  Holidays
                </NavLink>
                <NavLink to="/history" className={linkClass} onClick={close}>
                  History
                </NavLink>
              </>
            )}

            <div className="nav-spacer" />

            {isAdmin ? (
              <>
                <span className="admin-badge">{admin?.username || "Admin"}</span>
                <button type="button" className="ghost-btn nav-btn" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <NavLink to="/admin" className={linkClass} onClick={close}>
                Admin login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
