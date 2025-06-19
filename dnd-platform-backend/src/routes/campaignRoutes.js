const express = require("express");
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addPlayerToCampaign,
  joinCampaign,
} = require("../controllers/campaignController");
const { authenticate } = require("../middlewares/authMiddleware");
const { isDM } = require("../middlewares/campaignMiddleware"); // Новий middleware для перевірки DM

const router = express.Router();

// Будь-який користувач може створити кампанію (автоматично стає її DM)
router.post("/", authenticate, createCampaign);
router.post("/:id/join", authenticate, joinCampaign)
// Авторизовані користувачі можуть переглядати кампанії
router.get("/", authenticate, getCampaigns);
router.get("/:id", authenticate, getCampaignById);

// Тільки DM кампанії може оновлювати або видаляти її
router.put("/:id", authenticate, isDM, updateCampaign);
router.delete("/:id", authenticate, isDM, deleteCampaign);

// Додавання гравця у кампанію доступне тільки DM цієї кампанії
router.post("/add-player", authenticate, isDM, addPlayerToCampaign);


module.exports = router;
