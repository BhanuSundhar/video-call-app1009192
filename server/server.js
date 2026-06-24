

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors({ origin: "*" }));

app.get("/", (_, res) => {
  res.send("Video call server is running.");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("join-user", (user) => {
    if (!user?.phone) return;

    onlineUsers = onlineUsers.filter(
      (u) => u.phone !== user.phone
    );

    onlineUsers.push({
      socketId: socket.id,
      ...user,
    });

    io.emit("users-list", onlineUsers);
  });

  socket.on("call-user", (data) => {
    io.to(data.to).emit("incoming-call", {
      from: socket.id,
      callerName: data.callerName,
    });
  });

  socket.on("call-accepted", (data) => {
    io.to(data.to).emit("call-accepted", {
      acceptedBy: data.acceptedBy,
    });
  });

  socket.on("call-rejected", (data) => {
    io.to(data.to).emit("call-rejected", {
      from: socket.id,
    });
  });

  socket.on("offer", (data) => {
    io.to(data.to).emit("offer", {
      offer: data.offer,
      from: socket.id,
    });
  });

  socket.on("answer", (data) => {
    io.to(data.to).emit("answer", {
      answer: data.answer,
      from: socket.id,
    });
  });

  socket.on("ice-candidate", (data) => {
    if (!data?.candidate) return;

    io.to(data.to).emit("ice-candidate", {
      candidate: data.candidate,
      from: socket.id,
    });
  });

  socket.on("end-call", (data) => {
    io.to(data.to).emit("call-ended", {
      from: socket.id,
    });
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (u) => u.socketId !== socket.id
    );

    io.emit("users-list", onlineUsers);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
