const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const {
  getHolidays,
  addHoliday,
  deleteHoliday,
} = require("../controllers/holidayController");

// Everyone needs to see holidays so the booking table can show them.
router.get("/", getHolidays);
router.post("/", verifyToken, requireAdmin, addHoliday);
router.delete("/:id", verifyToken, requireAdmin, deleteHoliday);

module.exports = router;
