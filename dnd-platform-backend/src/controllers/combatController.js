const prisma = require('../utils/prisma'); // Або '../config/prisma', якщо створив там

const startCombat = async (req, res) => {
  try {
    const { campaignId, characters } = req.body; // Список персонажів для бою
    const { userId } = req.user;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.dmId !== userId) {
      return res.status(403).json({ error: "Only DM can start combat" });
    }

    const combatSession = await prisma.combatSession.create({
      data: { campaignId },
    });

    const turns = await Promise.all(
      characters.map(async (characterId) => {
        const initiative = Math.floor(Math.random() * 20) + 1; // Кидаємо d20
        return await prisma.combatTurn.create({
          data: { sessionId: combatSession.id, characterId, initiative },
        });
      })
    );

    res.json({ combatSession, turns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCombatState = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const combat = await prisma.combatSession.findUnique({
      where: { id: sessionId },
      include: { turns: { include: { character: true }, orderBy: { initiative: "desc" } } },
    });

    if (!combat) return res.status(404).json({ error: "Combat not found" });

    res.json(combat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const endCombat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await prisma.combatSession.update({
      where: { id: sessionId },
      data: { active: false },
    });

    res.json({ message: "Combat ended" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { startCombat, getCombatState, endCombat };
