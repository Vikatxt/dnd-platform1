const { Server } = require("socket.io");

let io;
let voiceRooms = {};

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("🚀 Socket.IO сервер ініціалізовано");

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // === ТЕКСТОВИЙ ЧАТ ===
    socket.on("joinChat", (campaignId) => {
      const room = `chat-${campaignId}`;
      socket.join(room);
      console.log(`💬 ${socket.id} приєднався до ${room}`);
    });

    socket.on("leaveChat", (campaignId) => {
      const room = `chat-${campaignId}`;
      socket.leave(room);
      console.log(`👋 ${socket.id} покинув ${room}`);
    });

    // === ГОЛОСОВИЙ ЧАТ ===
    socket.on("joinVoice", ({ campaignId, user }) => {
      const room = `voice-${campaignId}`;
      const userId = user?.id || socket.id;
      socket.join(room);
      socket.userId = userId;
      socket.campaignId = campaignId;

      if (!voiceRooms[room]) voiceRooms[room] = {};

      // ❗ Замінюємо старий socket, якщо був
      voiceRooms[room][userId] = {
        socketId: socket.id,
        nickname: user?.nickname || user?.username || "Anonymous",
        username: user?.username || "unknown",
        avatar: user?.avatar || null,
        muted: user?.muted ?? true, // нове поле
      };

      console.log(`🎙 ${user.username} приєднався до ${room}`);

      // Відправляємо новому список інших
      const users = Object.entries(voiceRooms[room])
        .filter(([id]) => id !== userId)
        .map(([id, user]) => ({ id: user.socketId, user }));

      socket.emit("roomUsers", users);

      // Всім іншим — що новий з’явився
      socket.to(room).emit("userConnected", {
        id: socket.id,
        user: voiceRooms[room][userId],
      });
    });

    socket.on("getRoomUsers", (campaignId) => {
      const room = `voice-${campaignId}`;
      if (!voiceRooms[room]) return;

      const users = Object.entries(voiceRooms[room])
        .filter(([id, u]) => u.socketId !== socket.id)
        .map(([id, user]) => ({ id: user.socketId, user }));

      socket.emit("roomUsers", users);
    });

    socket.on("leaveVoice", (campaignId) => {
      const room = `voice-${campaignId}`;
      handleVoiceDisconnect(socket, room);
    });

    // === ОНОВЛЕННЯ СТАНУ МІКРОФОНА ===
    socket.on("updateMicState", ({ campaignId, userId, muted }) => {
      const room = `voice-${campaignId}`;
      if (voiceRooms[room]?.[userId]) {
        voiceRooms[room][userId].muted = muted;
        socket.to(room).emit("micStateUpdated", { userId, muted });
      }
    });

    // === WebRTC ===
    socket.on("offer", ({ target, sdp }) => {
      socket.to(target).emit("offer", { from: socket.id, sdp });
    });

    socket.on("answer", ({ target, sdp }) => {
      socket.to(target).emit("answer", { from: socket.id, sdp });
    });

    socket.on("ice-candidate", ({ target, candidate }) => {
      socket.to(target).emit("ice-candidate", { from: socket.id, candidate });
    });

    socket.on("disconnect", () => {
      const room = `voice-${socket.campaignId}`;
      handleVoiceDisconnect(socket, room);
    });
  });

  const handleVoiceDisconnect = (socket, room) => {
    if (!room || !voiceRooms[room]) return;

    const userId = socket.userId;

    if (voiceRooms[room][userId]?.socketId === socket.id) {
      socket.to(room).emit("userDisconnected", { id: socket.id });
      delete voiceRooms[room][userId];
      console.log(`🚪 ${socket.id} (user: ${userId}) залишив ${room}`);

      if (Object.keys(voiceRooms[room]).length === 0) {
        delete voiceRooms[room];
      }
    }

    socket.leave(room);
  };

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io is not initialized! Call init(server) first.");
  return io;
};

module.exports = { init, getIO };