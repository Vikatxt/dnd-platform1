const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const logger = require("../utils/logger");

const authenticate = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      logger.warn("Unauthorized access attempt - No token provided");
      return res.status(401).json({ error: "Доступ заборонено: токен не надано" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Перевірка, що токен містить userId
    if (!decoded?.userId) {
      logger.error("JWT не містить userId");
      return res.status(401).json({ error: "Недійсний токен: відсутній userId" });
    }

    // 📦 Додатково: отримати користувача з БД (опціонально, але краще)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      logger.warn("User not found in DB");
      return res.status(401).json({ error: "Користувача не знайдено" });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    logger.info(`✅ User ${user.id} authenticated`);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Token expired for user");
      return res.status(401).json({ error: "Токен прострочений, будь ласка, увійдіть знову" });
    }

    logger.error("Invalid token provided:", error.message);
    console.error("Помилка перевірки токена:", error);
    return res.status(403).json({ error: "Недійсний токен" });
  }
};

module.exports = { authenticate };
