const prisma = require('../utils/prisma')

// 🔍 Отримати всі приховані клітинки для мапи
const getFogTiles = async (req, res) => {
  try {
    const { mapId } = req.params

    const tiles = await prisma.fogTile.findMany({
      where: { mapId, hidden: true }, // показуємо тільки активний туман
    })

    res.json(tiles)
  } catch (err) {
    console.error('Помилка отримання туману:', err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
}

// 🌫️ Встановити стан клітинки (додати або видалити туман)
const setFogTile = async (req, res) => {
  try {
    const { mapId, x, y, hidden } = req.body
    const { userId } = req.user

    const map = await prisma.map.findUnique({ where: { id: mapId } })
    if (!map) return res.status(404).json({ error: 'Мапу не знайдено' })

    const campaign = await prisma.campaign.findUnique({
      where: { id: map.campaignId }
    })
    if (!campaign || campaign.ownerId !== userId) {
      return res.status(403).json({ error: 'Лише DM може редагувати туман' })
    }

    const existing = await prisma.fogTile.findFirst({ where: { mapId, x, y } })

    if (hidden) {
      // Додаємо або оновлюємо туман
      if (existing) {
        await prisma.fogTile.update({
          where: { id: existing.id },
          data: { hidden: true }
        })
      } else {
        await prisma.fogTile.create({ data: { mapId, x, y, hidden: true } })
      }
    } else {
      // Видаляємо клітинку, якщо треба показати зону
      if (existing) {
        await prisma.fogTile.delete({
          where: { id: existing.id }
        })
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Помилка setFogTile:', err)
    res.status(500).json({ error: 'Помилка сервера' })
  }
}

module.exports = {
  getFogTiles,
  setFogTile, // toggleFogTile більше не потрібен
}
