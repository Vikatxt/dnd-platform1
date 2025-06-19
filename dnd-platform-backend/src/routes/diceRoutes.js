const express = require("express");
const { roll } = require("../controllers/diceController");
const router = express.Router();

router.post("/roll", roll);

module.exports = router;
