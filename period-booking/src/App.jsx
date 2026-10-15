import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import TodayAvailabilityPage from "./pages/TodayAvailabilityPage";
import History from "./pages/History";
import EditBooking from "./pages/EditBooking";
import Bookings from "./pages/Bookings";
import Holidays from "./pages/Holidays";

import AdminLogin from "./components/AdminLogin";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login has its own centered layout */}
          <Route path="/admin" element={<AdminLogin />} />

          <Route element={<Layout />}>
            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/today" element={<TodayAvailabilityPage />} />

            {/* Admin-only pages */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute adminOnly>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/holidays"
              element={
                <ProtectedRoute adminOnly>
                  <Holidays />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute adminOnly>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute adminOnly>
                  <EditBooking />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h2>Page not found</h2>
                  <p>The page you requested does not exist.</p>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
