const express = require('express')
const { getMessages, sendMessage } = require('../controllers/chatController')
const { authenticate } = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/:campaignId', authenticate, getMessages)
router.post('/', authenticate, sendMessage)

module.exports = router
