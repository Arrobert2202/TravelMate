const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const auth = async (req, res, next) => {
  try{
    const header = req.headers.authorization;

    if(!header){
      return res.status(401).json({ message: "missing header for authorization" });
    }
    
    const token = header.split(' ')[1];

    jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
      if(error){
        return res.status(401).json({ message: "Session expired" });
      }

      const userId = decoded.id;
      const user = await User.findById(userId);
      if(!user){
        return res.status(401).json({ message: "User not found" });
      }
      const { password, ...userDetails } = user._doc;
      req.user = userDetails;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = auth;