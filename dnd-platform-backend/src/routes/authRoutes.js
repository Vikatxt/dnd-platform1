const express = require("express");
const { register, login, getMe, logout, changePassword, updateProfile } = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/logout", logout);
router.post("/change-password", authenticate, changePassword);
router.put("/update-profile", authenticate, updateProfile);

module.exports = router;
