const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const fogController = require('../controllers/fogController')

router.get('/:mapId', authenticate, fogController.getFogTiles)
router.post('/set', authenticate, fogController.setFogTile)


module.exports = router
