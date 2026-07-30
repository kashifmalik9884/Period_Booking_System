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

  const redirectTo = location.state?.from?.pathname || "/history";

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
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Admin Login</h1>
        <p>Sign in to access booking history, edit bookings, and delete records.</p>

        {error && <p className="error-text">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}