import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getBookings = () => API.get("/api/bookings");

export const createBooking = (data) => API.post("/api/bookings", data);

export const updateBooking = (id, data, token) =>
  API.put(`/api/bookings/${id}`, data, authConfig(token));

export const deleteBooking = (id, token) =>
  API.delete(`/api/bookings/${id}`, authConfig(token));

export const adminLogin = (data) => API.post("/api/auth/login", data);

export const loginAdmin = adminLogin;

export const getHistory = (token) =>
  API.get("/api/history", authConfig(token));
