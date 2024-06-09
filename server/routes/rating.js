const express = require('express');
const router = express.Router();
const Rating = require('../models/ratingSchema');
const auth = require('../middleware/auth');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
require("dotenv").config();

router.post('/ratings', auth, async (req, res) => {
  const { country, state, city, attraction, description, rating } = req.body;
  if (!country || !state || !city || !attraction || !description || !rating) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try{
    const userId = req.user._id.toString();
    
    const newRating = new Rating({ country, state, city, attraction, description, rating, userId });
    await newRating.save();
    console.log(newRating);

    res.status(201).json("Rating created succesfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create rating.'});
  }
});

router.post('/search', auth, async (req, res) => {
  const { attraction } = req.body;

  try{
    const regex = new RegExp(attraction, 'i');
    const ratings = await Rating.find({ attraction: regex });

    res.status(200).json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get attractions ratings.'});
  }
});

module.exports = router;