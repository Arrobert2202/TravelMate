const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const auth = async (req, res, next) => {
  try{
    const authHeader = req.headers.authorization;

    if(!authHeader){
      return res.sendStatus(401);
    }
    
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if(err){
        return res.status(401).json({
          message: "This session has expired. Please login."
        });
      }

      const { id } = decoded;
      const user = await User.findById(id);
      if(!user){
        return res.status(401).json({message: "User not found"});
      }
      const { password, ...data } = user._doc;
      req.user = data;
      next();
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Server error",
    });
  }
};

module.exports = auth;