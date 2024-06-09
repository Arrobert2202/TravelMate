const express = require('express');
const router = express.Router();
const Rating = require('../models/ratingSchema');
const auth = require('../middleware/auth');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
require("dotenv").config();

router.post('/attraction/ratings', auth, async (req, res) => {
  const { newRating } = req.body;
  try{
    const userId = req.user._id.toString();

    console.log("New rating: ", newRating);
    
    res.status(201).json(newRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create rating.'});
  }
});