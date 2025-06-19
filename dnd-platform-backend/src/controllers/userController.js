const prisma = require('../utils/prisma')

// 🔹 Отримати профіль користувача
const getProfile = async (req, res) => {
  const { userId } = req.user

  try {
    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        createdAt: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error("Помилка отримання профілю:", error)
    res.status(500).json({ error: "Помилка сервера" })
  }
}

// 🔹 Отримати кампанії, у яких користувач є або гравцем, або власником
const getUserCampaigns = async (req, res) => {
  const { userId } = req.user

  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { players: { some: { playerId: userId } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            nickname: true
          }
        },
        players: true
      }
    })

    res.json(campaigns)
  } catch (error) {
    console.error("Помилка отримання кампаній користувача:", error)
    res.status(500).json({ error: "Помилка сервера" })
  }
}

module.exports = { getProfile, getUserCampaigns }
