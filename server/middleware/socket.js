const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const socketAuth = async (socket, next) => {
  try{
    const token = socket.handshake.query.token;
    console.log("socketAuth: Received token:", token);

    if(!token){
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if(err){
        return next(new Error('Authentication error'));
      }

      const { id } = decoded;
      const user = await User.findById(id);
      if(!user){
        return next(new Error('User not found'));
      }

      socket.username = user.username;
      socket.userId = user._id;
      if( user.groups && user.groups.length>0){
        user.groups.forEach(group => {
          socket.join(group._id.toString());
          console.log(`socketAuth: User ${socket.username} joined group ${group._id}`);
        });
      }
      console.log('socketAuth: User authenticated successfully:', socket.username);
      next();
    });
  } catch (err) {
    next(new Error('Server error'));
  }
};

module.exports = socketAuth;