const prisma = require("../utils/prisma")
const { getIO } = require("../webrtc/signaling")

const sendMessage = async (req, res) => {
  try {
    const { campaignId, content } = req.body
    const userId = req.user?.userId

    // 🔐 Авторизація
    if (!userId) {
      console.warn('⚠️ Користувач не авторизований у sendMessage')
      return res.status(401).json({ error: 'Користувач не авторизований' })
    }

    // 🧼 Валідація
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Повідомлення не може бути порожнім' })
    }

    console.log('🟡 Нове повідомлення від:', userId, '→ кампанія', campaignId)

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })
    if (!campaign) {
      return res.status(404).json({ error: 'Кампанія не знайдена' })
    }

    const message = await prisma.message.create({
      data: {
        campaignId,
        senderId: userId,
        content: content.trim(),
      },
      include: {
        sender: true,
      },
    })

    console.log('📤 Повідомлення збережено в БД:', message)

    // 🧽 Очистка чутливої інформації
    const safeMessage = {
      id: message.id,
      content: message.content,
      campaignId: message.campaignId,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        nickname: message.sender.nickname,
        username: message.sender.username,
        avatar: message.sender.avatar,
      },
    }

    const io = getIO()
    const room = `chat-${campaignId}`
    const socketRoom = io.sockets.adapter.rooms.get(room)
    const clientsCount = socketRoom ? socketRoom.size : 0

    console.log(`📊 Клієнтів у кімнаті ${room}: ${clientsCount}`)

    if (clientsCount === 0) {
      console.warn(`⚠️ Немає активних клієнтів у ${room}`)
    }

    io.to(room).emit('newMessage', safeMessage)
    console.log('📨 Socket.IO: повідомлення надіслано в кімнату', room)

    res.status(201).json(safeMessage)
  } catch (error) {
    console.error(`❌ sendMessage error: ${error.message}`)
    res.status(500).json({ error: 'Внутрішня помилка сервера' })
  }
}

const getMessages = async (req, res) => {
  try {
    const { campaignId } = req.params

    const messages = await prisma.message.findMany({
      where: { campaignId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    })

    const cleanedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      campaignId: msg.campaignId,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender.id,
        nickname: msg.sender.nickname,
        username: msg.sender.username,
        avatar: msg.sender.avatar,
      },
    }))

    console.log(`📦 Отримано ${cleanedMessages.length} повідомлень з кампанії ${campaignId}`)

    res.json(cleanedMessages)
  } catch (error) {
    console.error(`❌ getMessages error: ${error.message}`)
    res.status(500).json({ error: 'Помилка при отриманні повідомлень' })
  }
}

module.exports = { sendMessage, getMessages }
