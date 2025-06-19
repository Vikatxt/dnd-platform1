const express = require("express");
const {
  uploadMap,
  deleteMap,
  revealFog,
  getMap,
  getMapsByCampaign,
  activateMap,
  deactivateMap,
  getActiveMapByCampaign,
} = require("../controllers/mapController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Спочатку спеціальні маршрути
router.get("/active", authenticate, getActiveMapByCampaign);

// 🔹 Далі решта
router.post("/", authenticate, uploadMap);
router.put("/fog", authenticate, revealFog);
router.get("/", authenticate, getMapsByCampaign);
router.get("/:campaignId", authenticate, getMap);
router.put("/:id/activate", authenticate, activateMap);
router.put("/:id/deactivate", authenticate, deactivateMap);
router.delete("/:id", authenticate, deleteMap);

module.exports = router;
