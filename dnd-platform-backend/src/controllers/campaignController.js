const prisma = require("../utils/prisma");

// 🔹 Створення кампанії (гравець стає DM цієї кампанії)
const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      avatar,
      isPublic,
      maxPlayers,
      allowMulticlass,
      useHomebrew,
      mapGridSize,
      difficulty,
      startLevel
    } = req.body;
    const { userId } = req.user;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description: description || "",
        avatar: avatar || "https://via.placeholder.com/300",
        ownerId: userId,
        isPublic: isPublic ?? true,
        maxPlayers: maxPlayers ?? 6,
        allowMulticlass: allowMulticlass ?? false,
        useHomebrew: useHomebrew ?? false,
        mapGridSize: mapGridSize ?? 5,
        difficulty: difficulty || "NORMAL",
        startLevel: startLevel ?? 1,
        players: {
          create: {
            playerId: userId,
            isDM: true
          }
        }
      }
    })

    // 🧩 додаємо ownerId вручну
    res.status(201).json({
      message: "Кампанія створена",
      campaign: {
        ...campaign,
        ownerId: userId
      }
    })
  } catch (error) {
    console.error("Помилка створення кампанії:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
}

// 🔹 Отримання всіх кампаній
// 🔹 Отримання всіх кампаній
const getCampaigns = async (req, res) => {
  try {
    const {
      search = "",
      isPublic,
      playersCount,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Спочатку отримуємо всі кампанії
    const campaigns = await prisma.campaign.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } }
            ]
          },
          isPublic !== undefined ? { isPublic: isPublic === "true" } : {}
        ]
      },
      include: {
        owner: true,
        players: true
      },
      orderBy: {
        [sortBy]: sortOrder === "asc" ? "asc" : "desc"
      }
    });

    // Якщо запит є — фільтруємо вручну по кількості гравців
    const filtered = playersCount
      ? campaigns.filter(c => c.players.length <= parseInt(playersCount))
      : campaigns;

    res.json(filtered);
  } catch (error) {
    console.error("Помилка завантаження кампаній:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};



// 🔹 Отримання кампанії за ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        owner: true,
        players: {
          include: {
            player: {
              select: { id: true, username: true, nickname: true }
            }
          }
        }
      }
      
    });

    if (!campaign) return res.status(404).json({ error: "Кампанія не знайдена" });

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" });
  }
};

// 🔹 Оновлення кампанії (може робити тільки власник)
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      avatar, 
      isPublic, 
      maxPlayers, 
      allowMulticlass, 
      useHomebrew, 
      mapGridSize, 
      difficulty, 
      startLevel 
    } = req.body;
    const { userId } = req.user;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) return res.status(404).json({ error: "Кампанія не знайдена" });

    if (campaign.ownerId !== userId) {
      return res.status(403).json({ error: "Тільки власник може оновлювати кампанію" });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: { 
        name, 
        description, 
        avatar, 
        isPublic, 
        maxPlayers, 
        allowMulticlass, 
        useHomebrew, 
        mapGridSize, 
        difficulty, 
        startLevel 
      },
    });

    res.json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" });
  }
};

// 🔹 Видалення кампанії (може робити тільки власник)
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) return res.status(404).json({ error: "Кампанія не знайдена" });

    if (campaign.ownerId !== userId) {
      return res.status(403).json({ error: "Тільки власник може видалити кампанію" });
    }

    await prisma.campaign.delete({ where: { id } });

    res.json({ message: "Кампанія видалена" });
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" });
  }
};

// 🔹 Додавання гравця в кампанію (може робити тільки `DM`)
const addPlayerToCampaign = async (req, res) => {
  try {
    const { campaignId, playerId } = req.body;
    const { userId } = req.user;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { players: true }
    });

    if (!campaign) {
      return res.status(404).json({ error: "Кампанія не знайдена" });
    }

    // Перевіряємо, чи є цей користувач `DM` у кампанії
    const isUserDM = await prisma.campaignPlayer.findFirst({
      where: { campaignId, playerId: userId, isDM: true }
    });

    if (!isUserDM) {
      return res.status(403).json({ error: "Тільки DM може додавати гравців" });
    }

    // Перевіряємо, чи кампанія вже заповнена
    if (campaign.players.length >= campaign.maxPlayers) {
      return res.status(400).json({ error: "Кампанія вже заповнена" });
    }

    const existingPlayer = await prisma.campaignPlayer.findFirst({
      where: { campaignId, playerId },
    });

    if (existingPlayer) {
      return res.status(400).json({ error: "Гравець вже у кампанії" });
    }

    const newPlayer = await prisma.campaignPlayer.create({
      data: { campaignId, playerId },
    });

    res.json(newPlayer);
  } catch (error) {
    res.status(500).json({ error: "Помилка сервера" });
  }
};

const joinCampaign = async (req, res) => {
  try {
    const { id: campaignId } = req.params;
    const { userId } = req.user;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { players: true }
    });

    if (!campaign) return res.status(404).json({ error: "Кампанія не знайдена" });

    const alreadyIn = campaign.players.some(p => p.playerId === userId);
    if (alreadyIn) return res.status(400).json({ error: "Ви вже у кампанії" });

    const newPlayer = await prisma.campaignPlayer.create({
      data: {
        campaignId,
        playerId: userId,
        isDM: false
      }
    });

    res.status(200).json({ message: "Приєднано до кампанії", player: newPlayer });
  } catch (err) {
    console.error("Помилка приєднання:", err);
    res.status(500).json({ error: "Помилка сервера" });
  }
};


module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addPlayerToCampaign,
  joinCampaign
};
