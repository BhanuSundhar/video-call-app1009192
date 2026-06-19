


const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(
      "EVENT:",
      event
    );
  });
  console.log("Connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log(
        "Disconnected:",
        socket.id,
        reason
    );
    });

    socket.on("join-user", (user) => {

      if (!user) {
        console.log("User is null");
        return;
      }

      onlineUsers = onlineUsers.filter(
        (u) => u.phone !== user.phone
      );

      onlineUsers.push({
        socketId: socket.id,
        ...user,
      });

      console.log("ONLINE USERS:", onlineUsers);

      io.emit("users-list", onlineUsers);

    });

    socket.on("offer", (data) => {

      console.log("OFFER RECEIVED");
      console.log("SENDING OFFER TO : ", data.to);
      io.to(data.to).emit("offer", {
        offer: data.offer,
        from: socket.id,
      });
    });

    socket.on("answer", (data) => {

      console.log("ANSWER RECEIVED");

      io.to(data.to).emit("answer", {
        answer: data.answer,
        from: socket.id,
      });
    });

    socket.on("ice-candidate", (data) => {

      console.log("ICE RECEIVED");

      io.to(data.to).emit(
        "ice-candidate",
        {
          candidate:
            data.candidate,
          from: socket.id,
        }
      );
    });

  socket.on("call-user", (data) => {
    console.log("CALL REQUEST:", data);

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
    io.to(data.to).emit("call-rejected");
  });

  socket.on("end-call", (data) => {
    io.to(data.to).emit("call-ended" );

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

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (u) => u.socketId !== socket.id
    );

    io.emit("users-list", onlineUsers);

    console.log("Disconnected:", socket.id);
  });
});

server.listen(5000, "0.0.0.0", () => {
  console.log("Server Running On Port 5000");
});