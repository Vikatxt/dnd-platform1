const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const {
  createNpc,
  updateNpcPosition,
  getNpcsByMap,
  deleteNpc,
} = require("../controllers/npcController");

router.use(authenticate);

router.post("/", createNpc);
router.put("/:id/position", updateNpcPosition);
router.get("/map/:mapId", getNpcsByMap); // ✅ Зміна тут
router.delete("/:id", deleteNpc);

module.exports = router;
