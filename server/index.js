const express = require("express");
const socketio = require("socket.io");

const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");
const PORT = process.env.PORT || 5000;

const app = express();

const router = require("./router");

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000", // This for CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource error
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("join", ({ name, room }, callback) => {
    // on clint side Chat.js socket.emit("join")
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }

    socket.emit("message", {
      user: "admin",
      text: `${user.name} joined to the room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    console.log("room", user);
    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    console.log("User has left");
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => {
  console.log("Server has started on Port : ", PORT);
});
