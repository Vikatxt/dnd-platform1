const prisma = require('../utils/prisma');

// 🔁 Переміщення персонажа
const moveCharacter = async (req, res) => {
  try {
    const { characterId, x, y, mapId } = req.body;
    const { userId } = req.user;

    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).json({ error: "Персонажа не знайдено" });
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id: character.campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Кампанію не знайдено" });
    }

    const isPlayer = character.playerId === userId;
    const isDM = campaign.ownerId === userId;

    if (!isPlayer && !isDM) {
      return res.status(403).json({ error: "Ви не маєте права переміщувати цього персонажа" });
    }

    let position = await prisma.characterPosition.findFirst({
      where: { characterId, mapId },
    });

    if (position) {
      position = await prisma.characterPosition.update({
        where: { id: position.id },
        data: { x, y },
      });
    } else {
      position = await prisma.characterPosition.create({
        data: { characterId, x, y, mapId },
      });
    }

    res.json(position);
  } catch (error) {
    console.error("Помилка переміщення:", error);
    res.status(500).json({ error: error.message });
  }
};



// 📍 Отримання всіх позицій на мапі
const getPositions = async (req, res) => {
  try {
    const { mapId } = req.params;

    const positions = await prisma.characterPosition.findMany({
      where: { mapId },
      include: {
        character: {
          include: {
            player: { select: { id: true, nickname: true } }
          }
        }
      }
    });

    res.json(positions);
  } catch (error) {
    console.error("Помилка отримання позицій:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { moveCharacter, getPositions };
