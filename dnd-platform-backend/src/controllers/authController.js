const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { validateEmail, validatePassword, validatePhone } = require("../utils/validation");

const register = async (req, res) => {
  try {
    const { email, phone, password, username, nickname } = req.body;

    // 🔐 Валідація
    if (!username) {
      return res.status(400).json({ error: "Логін обов'язковий" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email обов'язковий" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Невірний формат email" });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: "Невірний формат номера телефону" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Пароль має містити мінімум 8 символів, включаючи букви та цифри"
      });
    }

    // 🔎 Перевірка унікальності
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          phone ? { phone } : undefined,
          { username }
        ].filter(Boolean) // видаляємо undefined
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email вже зайнятий" });
      }
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ error: "Телефон вже зайнятий" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Логін вже зайнятий" });
      }
    }

    // 🔐 Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // ➕ Створення користувача
    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        username,
        nickname: nickname || username,
        password: hashedPassword,
        role: "PLAYER"
      },
    });

    res.status(201).json({ message: "Користувач зареєстрований", user });
  } catch (error) {
    console.error("❌ Помилка реєстрації:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};

const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "Необхідно вказати логін та пароль" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { phone: login },
          { username: login }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: "Користувач не знайдений" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Невірний пароль" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET не налаштовано!");
      return res.status(500).json({ error: "Помилка конфігурації сервера" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax" 
    });

    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
        nickname: user.nickname,
        role: user.role
      } 
    });
  } catch (error) {
    console.error("Помилка входу:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { 
        id: true, 
        email: true, 
        phone: true, 
        username: true, 
        nickname: true, 
        role: true 
      },
    });

    if (!user) return res.status(404).json({ error: "Користувач не знайдений" });

    res.json(user);
  } catch (error) {
    console.error("Помилка отримання користувача:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.json({ message: "Вихід виконано успішно" });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Необхідно вказати старий та новий паролі" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Новий пароль має містити мінімум 8 символів, включаючи букви та цифри"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: "Користувач не знайдений" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Старий пароль невірний" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed }
    });

    res.json({ message: "Пароль успішно змінено" });
  } catch (error) {
    console.error("Помилка зміни пароля:", error);
    res.status(500).json({ error: "Помилка сервера" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, nickname, email, phone } = req.body

    if (!username || !email) {
      return res.status(400).json({ error: "Логін і Email обов'язкові" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Невірний формат email" })
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: "Невірний формат номера телефону" })
    }

    // 🔍 Перевірка на унікальність (крім поточного користувача)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone },
          { username }
        ],
        NOT: { id: req.user.userId }
      }
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email вже зайнятий" })
      }
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ error: "Телефон вже зайнятий" })
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Логін вже зайнятий" })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        username,
        nickname,
        email,
        phone,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        role: true,
      }
    })

    res.json({ message: "Профіль оновлено", user: updatedUser })
  } catch (error) {
    console.error("Помилка оновлення профілю:", error)
    res.status(500).json({ error: "Помилка сервера" })
  }
}



module.exports = { register, login, getMe, logout, changePassword, updateProfile };
