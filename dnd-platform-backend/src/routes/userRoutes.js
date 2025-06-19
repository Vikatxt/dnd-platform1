const express = require("express")
const { getProfile, getUserCampaigns } = require("../controllers/userController")
const { authenticate } = require("../middlewares/authMiddleware")


const router = express.Router()

router.get("/me", authenticate, getProfile)
router.get("/me/campaigns", authenticate, getUserCampaigns)

module.exports = router
