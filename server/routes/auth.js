const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require("dotenv").config();

const generateTokens = (userId) => {
  return jwt.sign({ id: userId}, process.env.SECRET_KEY, { expiresIn: '1h' });
};

router.post('/register', async (req, res) =>{
  try{
    const { email, username, password} = req.body;
    
    const usernameTaken = await User.findOne({username});
    if(usernameTaken){
      return res.status(400).json({error: "This username already exists."});
    }

    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      username,
      password: hash_password,
      groups: []
    });
    
    const savedUser = await newUser.save();
    const token = generateTokens(savedUser._id);

    res.status(200).json({
      status: "success",
      message: "You have successfully registered.",
      token: token,
    });
  } catch(error){
    console.error(error);
    res.status(500).json({error: 'Registration failed'});
  }
});

router.post('/login', async (req, res) =>{
    const { username, password } = req.body;

    try{
      const user = await User.findOne({username});
      if(!user){
        return res.status(401).json({error: 'Authentication failed. Username doesn\'t exist.'});
      }
      
      const isValidPassword = await user.comparePassword(password);
      if(!isValidPassword){
        return res.status(401).send("Invalid username or password.");
      }

      const token = generateTokens(user._id);

      res.status(200).json({
        status: "success",
        message: "You have successfully logged in.",
        token: token,
        userId: user._id,
        username: user.username
      });
    } catch(error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed'});
    }
});

router.post('/logout', auth, async (req, res) => {
  try{ 
    res.status(200).json({
      message: "Logout successful"
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({error: 'Logout failed.'});
  }
});

module.exports = router;