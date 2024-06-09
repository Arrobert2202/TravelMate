const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const jwt = require('jsonwebtoken');
const { Server } = require("socket.io");
const connectDB = require("./db");
require("dotenv").config();
const multer = require('multer');

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const topdestinationsRoutes = require("./routes/destination");
const groupRoutes = require("./routes/groups");
const ratingRoute = require("./routes/rating");
const socketAuth = require("./middleware/socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ['GET', 'POST']
  }
});
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destination', topdestinationsRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/attraction', ratingRoute);

io.use(socketAuth);

io.on('connection', (socket) => {
  console.log("New user connected", socket.username);

  socket.on('receiveNewGroup', (newGroup) => {
    console.log(socket.username);
    console.log("New group: ", newGroup);
    io.sockets.sockets.forEach((connSocket) => {
      if (newGroup.members.some(member => member.userId === connSocket.userId.toString())) {
        connSocket.join(newGroup._id);
      }
    });
    io.to(newGroup._id).emit('newGroup', newGroup);
  });

  socket.on('sendNewMessage', (data) => {
    const { groupId, newMessage } = data;
    io.to(groupId).emit('newMessage', { groupId, newMessage });
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

server.listen(process.env.PORT, () =>{
  console.log(`Server is listening on port ${process.env.PORT}`);
});

module.exports = { app, server, io, upload };