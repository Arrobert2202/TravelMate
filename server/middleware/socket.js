const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const socketAuthenticate = async (socket, next) => {
  try{
    const token = socket.handshake.query.token;
    console.log("Received token: ", token);

    if(!token){
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
      if(error){
        return next(new Error('Session expired'));
      }

      const userId = decoded.id;
      const user = await User.findById(userId);
      if(!user){
        return next(new Error('User not found'));
      }

      socket.username = user.username;
      socket.userId = user._id;

      if( user.groups && user.groups.length>0){
        user.groups.forEach(group => {
          socket.join(group._id.toString());
          console.log(`User ${socket.username} joined group ${group._id}`);
        });
      }

      console.log('User authenticated successfully:', socket.username);
      next();
    });
  } catch (err) {
    next(new Error('Server error'));
  }
};

module.exports = socketAuthenticate;