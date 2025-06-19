const express = require("express");
const {
  createCharacter,
  getCharactersByCampaign,
  getMyCharacter,
  getMyCharactersInCampaign,
  getCharacterById // ✅ нове
} = require("../controllers/characterController");

const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createCharacter);
router.get("/:campaignId", authenticate, getCharactersByCampaign);
router.get("/me/:campaignId", authenticate, getMyCharacter);
router.get("/campaign/:campaignId/user", authenticate, getMyCharactersInCampaign);
router.get("/by-id/:id", authenticate, getCharacterById); // ✅ додано сюди

module.exports = router;
