const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

router.get("/", getBookings);
// Open to everyone; a valid admin token additionally allows booking today.
router.post("/", verifyToken.optional, createBooking);
router.put("/:id", verifyToken, requireAdmin, updateBooking);
router.delete("/:id", verifyToken, requireAdmin, deleteBooking);

module.exports = router;
