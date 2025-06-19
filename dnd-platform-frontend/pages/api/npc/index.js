import prisma from '@/lib/prisma'
import authenticate from '@/middleware/authenticate' // якщо є

export default authenticate(async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, type, imageUrl, stats, mapId, x = 0, y = 0 } = req.body
      const { userId } = req.user

      if (!name || !type || !stats || Object.keys(stats).length !== 10) {
        return res.status(400).json({ error: 'Некоректні або неповні дані NPC' })
      }

      const npc = await prisma.npc.create({
        data: {
          name,
          type,
          imageUrl,
          stats,
          mapId,
          x,
          y,
        },
      })

      res.status(201).json(npc)
    } catch (err) {
      console.error('❌ Помилка створення NPC:', err)
      res.status(500).json({ error: 'Помилка сервера' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Метод ${req.method} не дозволено`)
  }
})
