const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const topdestinationsRoutes = require("./routes/topDestinations");
//const groupRoutes = require("./routes/groups");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/topdestinations', topdestinationsRoutes);
//app.use('/api/groups', groupRoutes);

io.on('connection', (socket) =>{
  console.log("New user connected");

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User joined group ${groupId}`);
  });

  socket.on('leaveGroup', (groupId) => {
    socket.leave(groupId);
    console.log(`User left group ${groupId}`);
  });

  socket.on('sendMessage', (message) => {
    const groupId = message.groupId;
    io.to(groupId).emit('recevieMessage', message);
  });

  socket.on('disconnect', () => {
    console.log("A user disconnected")
  });
});

server.listen(process.env.PORT, () =>{
  console.log(`Server is listening on port ${process.env.PORT}`);
});

module.exports = { app, server, io}