const express = require("express");
const { startCombat, getCombatState, endCombat } = require("../controllers/combatController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/start", authenticate, startCombat);
router.get("/:sessionId", authenticate, getCombatState);
router.put("/:sessionId/end", authenticate, endCombat);

module.exports = router;
