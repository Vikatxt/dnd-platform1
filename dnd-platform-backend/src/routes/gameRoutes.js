const express = require('express')
const router = express.Router()
const { getGameState } = require('../controllers/gameController')

// GET /api/game/:campaignId
router.get('/:campaignId', getGameState)

module.exports = router
