const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const { getHistory } = require("../controllers/historyController");

router.get("/", verifyToken, requireAdmin, getHistory);

module.exports = router;