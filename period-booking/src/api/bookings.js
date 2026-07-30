import axios from "axios";

const API = "http://localhost:5000/api";

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getBookings = () => axios.get(`${API}/bookings`);

export const createBooking = (data) => axios.post(`${API}/bookings`, data);

export const updateBooking = (id, data, token) =>
  axios.put(`${API}/bookings/${id}`, data, authConfig(token));

export const deleteBooking = (id, token) =>
  axios.delete(`${API}/bookings/${id}`, authConfig(token));

export const loginAdmin = (data) => axios.post(`${API}/auth/login`, data);

export const getHistory = (token) =>
  axios.get(`${API}/history`, authConfig(token));