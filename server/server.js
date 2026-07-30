const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const historyRoutes = require("./routes/historyRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
  res.send("Period Booking API Running");
});

const PORT = process.env.PORT || 5000;

pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL connected successfully");
    client.release();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("PostgreSQL connection failed:", error.message);
  });