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

// Pass the admin token to let an admin book today. Visitors call it without a token.
export const createBooking = (data, token) =>
  API.post("/api/bookings", data, token ? authConfig(token) : undefined);

export const updateBooking = (id, data, token) =>
  API.put(`/api/bookings/${id}`, data, authConfig(token));

export const deleteBooking = (id, token) =>
  API.delete(`/api/bookings/${id}`, authConfig(token));

export const adminLogin = (data) => API.post("/api/auth/login", data);

export const loginAdmin = adminLogin;

export const getHistory = (token) =>
  API.get("/api/history", authConfig(token));

export const getHolidays = () => API.get("/api/holidays");

export const addHoliday = (data, token) =>
  API.post("/api/holidays", data, authConfig(token));

export const deleteHoliday = (id, token) =>
  API.delete(`/api/holidays/${id}`, authConfig(token));
