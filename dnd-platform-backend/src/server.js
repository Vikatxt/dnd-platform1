require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { PrismaClient } = require("@prisma/client");
const signaling = require("./webrtc/signaling");

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app); // HTTP-сервер для Express + WebSocket

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// 🔗 Роути
const authRoutes = require("./routes/authRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const characterRoutes = require("./routes/characterRoutes");
const diceRoutes = require("./routes/diceRoutes");
const combatRoutes = require("./routes/combatRoutes");
const mapRoutes = require("./routes/mapRoutes");
const positionRoutes = require("./routes/positionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const fogRoutes = require("./routes/fogRoutes");
const npcRoutes = require("./routes/npcRoutes");
const gameRoutes = require("./routes/gameRoutes");
const userRoutes = require("./routes/userRoutes"); // ✅ новий маршрут

// 🧭 Підключення маршрутів
app.use("/chat", chatRoutes);
app.use("/positions", positionRoutes);
app.use("/maps", mapRoutes);
app.use("/combat", combatRoutes);
app.use("/dice", diceRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/auth", authRoutes);
app.use("/characters", characterRoutes);
app.use("/fog", fogRoutes);
app.use("/npc", npcRoutes);
app.use("/api/game", gameRoutes);
app.use("/users", userRoutes); // ✅ сторінка профілю

// 🧠 WebSocket логіка
signaling.init(server);

// 🚀 Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
