import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import TodayAvailabilityPage from "./pages/TodayAvailabilityPage";
import History from "./pages/History";
import EditBooking from "./pages/EditBooking";
import Bookings from "./pages/Bookings";

import AdminLogin from "./components/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public booking page */}
          <Route path="/" element={<Home />} />

          {/* Public today availability page */}
          <Route
            path="/today"
            element={<TodayAvailabilityPage />}
          />

          {/* Public admin login page */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin-only active bookings page */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute adminOnly>
                <Bookings />
              </ProtectedRoute>
            }
          />

          {/* Admin-only booking history page */}
          <Route
            path="/history"
            element={
              <ProtectedRoute adminOnly>
                <History />
              </ProtectedRoute>
            }
          />

          {/* Admin-only edit page */}
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute adminOnly>
                <EditBooking />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route
            path="*"
            element={
              <div className="page-shell">
                <div className="empty-state">
                  <h2>Page not found</h2>
                  <p>The page you requested does not exist.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
