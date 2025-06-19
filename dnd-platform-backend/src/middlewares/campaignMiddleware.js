const prisma = require("../utils/prisma");

const isDM = async (req, res, next) => {
  try {
    const { id: campaignId } = req.params; // ID кампанії з URL
    const userId = req.user.userId; // ID авторизованого користувача

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { players: true },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Кампанія не знайдена" });
    }

    // Перевіряємо, чи є цей користувач DM у цій кампанії
    const isUserDM = campaign.players.some(
      (player) => player.playerId === userId && player.isDM
    );

    if (!isUserDM) {
      return res.status(403).json({ error: "Недостатньо прав" });
    }

    next(); // Користувач є DM → продовжуємо виконання
  } catch (error) {
    console.error("Помилка перевірки DM:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};

module.exports = { isDM };
