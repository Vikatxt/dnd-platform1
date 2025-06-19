const prisma = require('../utils/prisma')

// Отримати повний стан гри по кампанії
const getGameState = async (req, res) => {
  try {
    const { campaignId } = req.params

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        maps: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            positions: {
              include: {
                character: {
                  include: {
                    player: {
                      select: { id: true, username: true, nickname: true }
                    }
                  }
                }
              }
            },
            fogTiles: true,
            npcs: true
          }
        },
        players: {
          include: {
            player: {
              select: { id: true, username: true, nickname: true }
            }
          }
        },
        characters: {
          include: {
            player: {
              select: { id: true, username: true, nickname: true }
            }
          }
        },
        messages: {
          include: {
            sender: {
              select: { id: true, username: true, nickname: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!campaign) return res.status(404).json({ error: 'Кампанію не знайдено' })

    // Витягуємо актуальну мапу
    const map = campaign.maps?.[0] || null

    res.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        avatar: campaign.avatar,
        isPublic: campaign.isPublic,
        maxPlayers: campaign.maxPlayers,
        difficulty: campaign.difficulty,
        startLevel: campaign.startLevel
      },
      players: campaign.players,
      characters: campaign.characters,
      messages: campaign.messages,
      map
    })
  } catch (error) {
    console.error('Помилка при отриманні стану гри:', error)
    res.status(500).json({ error: 'Серверна помилка' })
  }
}

module.exports = { getGameState }
