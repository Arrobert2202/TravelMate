const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

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
      password: hash_password
    });
    
    const savedUser = await newUser.save();
    res.json({
      message: "User registered successfully",
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        username: savedUser.username
      }
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

      console.log(process.env.SECRET_KEY);
      const token = jwt.sign({userId: user.id}, process.env.SECRET_KEY);

      res.send({token});
    } catch(error) {
      console.error(error);
      res.status(500).json({ error: 'Login failed'});
    }
});

module.exports = router