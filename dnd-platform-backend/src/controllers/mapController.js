const prisma = require('../utils/prisma')

// 🔹 Створення мапи (тільки DM)
const uploadMap = async (req, res) => {
  try {
    const { campaignId, imageUrl, width, height, name } = req.body
    const { userId } = req.user

    if (!campaignId || !imageUrl || !width || !height) {
      return res.status(400).json({ error: 'Усі поля обов’язкові' })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { players: true }
    })

    if (!campaign) {
      return res.status(404).json({ error: 'Кампанію не знайдено' })
    }

    const isDM = campaign.players.some(p => p.playerId === userId && p.isDM)
    if (!isDM) {
      return res.status(403).json({ error: 'Лише DM може завантажити мапу' })
    }

    const map = await prisma.map.create({
      data: {
        campaignId,
        imageUrl: imageUrl.trim(),
        width: Number(width),
        height: Number(height),
        name: name?.trim() || null,
      }
    })

    res.status(201).json(map)
  } catch (error) {
    console.error('❌ uploadMap error:', error)
    res.status(500).json({ error: 'Помилка сервера: ' + error.message })
  }
}

// 🔹 Отримати всі мапи кампанії
// 🔹 Отримати всі мапи кампанії з позначкою активної
const getMapsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.query;

    if (!campaignId || typeof campaignId !== 'string') {
      return res.status(400).json({ error: 'Некоректне або відсутнє campaignId' });
    }

    const [maps, campaign] = await Promise.all([
      prisma.map.findMany({
        where: { campaignId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { activeMapId: true }
      })
    ]);

    const result = maps.map(map => ({
      ...map,
      active: map.id === campaign?.activeMapId
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Помилка отримання мап:', error);
    res.status(500).json({ error: 'Помилка сервера: ' + error.message });
  }
};

// 🔹 Отримати мапу за id
const getMap = async (req, res) => {
  try {
    const { id } = req.params

    const map = await prisma.map.findUnique({ where: { id } })
    if (!map) return res.status(404).json({ error: 'Мапу не знайдено' })

    res.json(map)
  } catch (error) {
    console.error('getMap error:', error)
    res.status(500).json({ error: 'Помилка сервера: ' + error.message })
  }
}

// 🔹 Редагування туману війни (тільки DM)
const revealFog = async (req, res) => {
  try {
    const { mapId, fogData } = req.body
    const { userId } = req.user

    const map = await prisma.map.findUnique({
      where: { id: mapId },
      include: { campaign: { include: { players: true } } }
    })

    if (!map) return res.status(404).json({ error: 'Мапу не знайдено' })

    const isDM = map.campaign.players.some(p => p.playerId === userId && p.isDM)
    if (!isDM) {
      return res.status(403).json({ error: 'Тільки DM може змінювати туман' })
    }

    const updatedMap = await prisma.map.update({
      where: { id: map.id },
      data: { fog: fogData }
    })

    res.json(updatedMap)
  } catch (error) {
    console.error('revealFog error:', error)
    res.status(500).json({ error: 'Помилка сервера: ' + error.message })
  }
}

// 🔹 Активувати мапу
const activateMap = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user

    const map = await prisma.map.findUnique({
      where: { id },
      include: { campaign: { include: { players: true } } }
    })

    if (!map) return res.status(404).json({ error: 'Мапу не знайдено' })

    const isDM = map.campaign.players.some(p => p.playerId === userId && p.isDM)
    if (!isDM) return res.status(403).json({ error: 'Лише DM може активувати мапу' })

    await prisma.campaign.update({
      where: { id: map.campaignId },
      data: { activeMapId: map.id }
    })

    res.json({ message: 'Мапу активовано', mapId: map.id })
  } catch (error) {
    console.error('Map activation error:', error)
    res.status(500).json({ error: 'Помилка сервера: ' + error.message })
  }
}

const getActiveMapByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.query

    if (!campaignId || typeof campaignId !== 'string') {
      return res.status(400).json({ error: 'campaignId обов’язковий' })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { activeMapId: true }
    })

    if (!campaign?.activeMapId) {
      return res.status(404).json({ error: 'Активна мапа не встановлена' })
    }

    const map = await prisma.map.findUnique({
      where: { id: campaign.activeMapId }
    })

    if (!map) return res.status(404).json({ error: 'Мапу не знайдено' })

    res.json(map)
  } catch (err) {
    console.error('getActiveMapByCampaign error:', err)
    res.status(500).json({ error: 'Помилка сервера: ' + err.message })
  }
}

// 🔹 Деактивувати мапу
// 🔹 Деактивувати мапу
const deactivateMap = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    console.log("➡️ Запит на деактивацію мапи:", id);

    const map = await prisma.map.findUnique({
      where: { id },
      include: {
        campaign: {
          include: { players: true },
        },
      },
    });

    if (!map) {
      console.warn("⚠️ Мапу не знайдено:", id);
      return res.status(404).json({ error: "Мапу не знайдено" });
    }

    const isDM = map.campaign.players.some(
      (p) => p.playerId === userId && p.isDM
    );
    if (!isDM) {
      console.warn("❌ Користувач не є DM:", userId);
      return res.status(403).json({ error: "Лише DM може деактивувати мапу" });
    }

    console.log("🧾 campaign.activeMapId:", map.campaign.activeMapId);
    console.log("🧾 map.id:", map.id);
    console.log("🧾 req.params.id:", id);

    const activeMapId = map.campaign.activeMapId?.trim();
    const thisMapId = map.id.trim();

    if (activeMapId !== thisMapId) {
      console.warn("⚠️ Ця мапа не є активною");
      return res
        .status(400)
        .json({ error: "Ця мапа не є активною — деактивація неможлива" });
    }

    await prisma.campaign.update({
      where: { id: map.campaignId },
      data: { activeMapId: null },
    });

    console.log("✅ Мапу деактивовано:", id);
    res.json({ message: "Мапу деактивовано" });
  } catch (error) {
    console.error("🔥 Map deactivation error:", error);
    res.status(500).json({ error: "Помилка сервера: " + error.message });
  }
};


// 🔹 Видалити мапу (тільки якщо не активна)
const deleteMap = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.user

    const map = await prisma.map.findUnique({
      where: { id },
      include: { campaign: { include: { players: true } } }
    })

    if (!map) return res.status(404).json({ error: 'Мапу не знайдено' })

    const isDM = map.campaign.players.some(p => p.playerId === userId && p.isDM)
    if (!isDM) return res.status(403).json({ error: 'Лише DM може видаляти мапу' })

    if (map.campaign.activeMapId === id) {
      return res.status(400).json({ error: 'Мапа є активною. Спочатку деактивуйте її.' })
    }

    await prisma.map.delete({ where: { id } })

    res.json({ message: 'Мапу успішно видалено' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Внутрішня помилка сервера' })
  }
}

module.exports = {
  uploadMap,
  getMapsByCampaign,
  getMap,
  revealFog,
  activateMap,
  getActiveMapByCampaign,
  deactivateMap,
  deleteMap,
}
