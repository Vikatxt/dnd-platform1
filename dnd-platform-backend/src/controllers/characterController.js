const prisma = require('../utils/prisma');

// 🔹 Створення нового персонажа
const createCharacter = async (req, res) => {
  try {
    const {
      name,
      class: charClass,
      race,
      level = 1,
      stats,
      campaignId,
      details = {}
    } = req.body;

    const { userId } = req.user;

    if (!name || !charClass || !race || !campaignId) {
      return res.status(400).json({ error: 'Обовʼязкові поля відсутні' });
    }

    if (!stats || Object.keys(stats).length !== 6) {
      return res.status(400).json({ error: 'Очікується 6 характеристик персонажа' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { players: true }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Кампанія не знайдена' });
    }

    const safeDetails = {
      hp: Number.isFinite(+details.hp) ? +details.hp : 10,
      ac: Number.isFinite(+details.ac) ? +details.ac : 10,
      initiative: Number.isFinite(+details.initiative) ? +details.initiative : 0,
      image: details.image || null
    };

    const character = await prisma.character.create({
      data: {
        name,
        class: charClass,
        race,
        level,
        stats,
        details: safeDetails,
        campaignId,
        playerId: userId
      }
    });

    const alreadyJoined = campaign.players.some(p => p.playerId === userId);
    if (!alreadyJoined) {
      await prisma.campaignPlayer.create({
        data: {
          campaignId,
          playerId: userId,
          isDM: false
        }
      });
    }

    res.status(201).json(character);
  } catch (error) {
    console.error('❌ Помилка створення персонажа:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

// 🔹 Отримати всіх персонажів кампанії
const getCharactersByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const characters = await prisma.character.findMany({
      where: { campaignId },
      include: {
        player: {
          select: { id: true, username: true, nickname: true }
        }
      }
    });

    res.json(characters);
  } catch (error) {
    console.error('❌ Помилка отримання персонажів кампанії:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

// 🔹 Отримати конкретного персонажа по ID
const getCharacterById = async (req, res) => {
  try {
    const { id } = req.params;

    const character = await prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        class: true,
        race: true,
        level: true,
        stats: true,
        details: true,
        player: {
          select: {
            id: true,
            nickname: true,
            username: true
          }
        },
        campaign: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!character) {
      return res.status(404).json({ error: 'Персонаж не знайдений' });
    }

    res.json(character);
  } catch (error) {
    console.error('❌ Помилка отримання персонажа по ID:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

// 🔹 Отримати першого персонажа поточного користувача в кампанії (за замовчуванням)
const getMyCharacter = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { userId } = req.user;

    const character = await prisma.character.findFirst({
      where: {
        campaignId,
        playerId: userId
      },
      select: {
        id: true,
        name: true,
        class: true,
        race: true,
        level: true,
        stats: true,
        details: true,
        player: {
          select: {
            id: true,
            nickname: true,
            username: true
          }
        },
        campaign: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!character) {
      return res.status(404).json({ error: 'Персонаж не знайдений' });
    }

    res.json(character);
  } catch (error) {
    console.error('❌ Помилка отримання персонажа:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

// 🔹 Отримати всі персонажі користувача в кампанії
const getMyCharactersInCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { userId } = req.user;

    if (!campaignId) {
      return res.status(400).json({ error: 'Не вказано campaignId' });
    }

    const characters = await prisma.character.findMany({
      where: {
        campaignId,
        playerId: userId
      },
      select: {
        id: true,
        name: true,
        class: true,
        race: true,
        level: true
      }
    });

    res.json(characters);
  } catch (error) {
    console.error('❌ Помилка отримання персонажів користувача:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
};

module.exports = {
  createCharacter,
  getCharactersByCampaign,
  getCharacterById, // ✅ новий
  getMyCharacter,
  getMyCharactersInCampaign
};
