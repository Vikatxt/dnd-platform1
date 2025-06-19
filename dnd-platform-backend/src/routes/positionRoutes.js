const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const { moveCharacter, getPositions } = require("../controllers/positionController");

const router = express.Router();

router.get("/:mapId", authenticate, getPositions);
router.post("/move", authenticate, moveCharacter); // новий POST-запит

module.exports = router;
