const express = require("express");
const { login, profile, signup } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, profile);

module.exports = router;
