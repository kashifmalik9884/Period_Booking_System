import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/bookings";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      setSubmitting(true);
      const res = await loginAdmin(form);
      login(res.data);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">P</span>
          <span className="brand-text">Period Booking</span>
        </div>

        <h1>Admin login</h1>
        <p>Sign in to manage bookings, holidays and booking history.</p>

        {error && <p className="error-text">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Username</span>
            <input
              name="username"
              autoComplete="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
          </label>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </button>

          <button type="button" className="ghost-btn" onClick={() => navigate("/")}>
            Back to home
          </button>
        </form>
      </div>
    </div>
  );
}
