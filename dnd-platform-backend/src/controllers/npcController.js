const prisma = require('../utils/prisma');

// Створення нового NPC
const createNpc = async (req, res) => {
  try {
    const { name, type, imageUrl, stats, mapId } = req.body;
    const { userId } = req.user;

    if (!name || !type || !mapId) {
      return res.status(400).json({ error: 'Некоректні дані для NPC' });
    }

    const map = await prisma.map.findUnique({
      where: { id: mapId },
      include: { campaign: true }
    });

    if (!map || map.campaign.ownerId !== userId) {
      return res.status(403).json({ error: 'Ви не є DM цієї кампанії' });
    }

    const npc = await prisma.npc.create({
      data: {
        name,
        type,
        imageUrl,
        stats,
        x: 0,
        y: 0,
        mapId
      }
    });

    res.status(201).json(npc);
  } catch (err) {
    console.error("Помилка створення NPC:", err);
    res.status(500).json({ error: "Помилка сервера при створенні NPC" });
  }
};

// Оновлення позиції NPC
const updateNpcPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { x, y } = req.body;
    const { userId } = req.user;

    const npc = await prisma.npc.findUnique({
      where: { id },
      include: {
        map: {
          include: {
            campaign: true
          }
        }
      }
    });

    if (!npc || npc.map.campaign.ownerId !== userId) {
      return res.status(403).json({ error: 'Ви не є DM цієї кампанії' });
    }

    const updated = await prisma.npc.update({
      where: { id },
      data: { x, y }
    });

    res.json(updated);
  } catch (err) {
    console.error("Помилка оновлення NPC:", err);
    res.status(500).json({ error: "Не вдалося оновити позицію NPC" });
  }
};

// Отримання всіх NPC на мапі
const getNpcsByMap = async (req, res) => {
  try {
    const { mapId } = req.params;

    const npcs = await prisma.npc.findMany({
      where: { mapId }
    });

    res.json(npcs);
  } catch (err) {
    console.error("Помилка отримання NPC:", err);
    res.status(500).json({ error: "Не вдалося отримати NPC" });
  }
};

// Видалення NPC
const deleteNpc = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const npc = await prisma.npc.findUnique({
      where: { id },
      include: {
        map: {
          include: {
            campaign: true
          }
        }
      }
    });

    if (!npc || npc.map.campaign.ownerId !== userId) {
      return res.status(403).json({ error: 'Недостатньо прав' });
    }

    await prisma.npc.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error("Помилка видалення NPC:", err);
    res.status(500).json({ error: "Не вдалося видалити NPC" });
  }
};

module.exports = {
  createNpc,
  updateNpcPosition,
  getNpcsByMap,
  deleteNpc
};
