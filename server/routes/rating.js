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
    
    let existingRating = await Rating.findOne({ country, state, city, attraction });

    if(existingRating){
      if (existingRating.users.includes(userId)) {
        return res.status(400).json({ message: 'Cannot rate an atraction more than one time' });
      }
      description.forEach((word) => {
        if(existingRating.description.has(word)){
          existingRating.description.set(word, existingRating.description.get(word)+1);
        } else {
          existingRating.description.set(word, 1);
        }
      });
      const totalRatings = existingRating.count * existingRating.rating + rating;
      const newCount = existingRating.count + 1;
      const newRating = totalRatings / newCount;

      existingRating.rating = newRating;
      existingRating.count = newCount;
      existingRating.users.push(userId);

      await existingRating.save();

      res.status(200).json("Rating updated");
    } else {
      const map = new Map();
      description.forEach((word) => {
        map.set(word, 1);
      });

      const newRating = new Rating({ country, state, city, attraction, description: map, rating, users: [userId], count: 1 });
      await newRating.save();
      console.log(newRating);

      res.status(201).json("Rating created succesfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create rating.'});
  }
});

router.post('/search', auth, async (req, res) => {
  const { attraction } = req.body;

  try{
    const regex = new RegExp(attraction, 'i');
    const ratings = await Rating.find({ attraction: { $regex: regex }});

    res.status(200).json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get attractions ratings.'});
  }
});

router.post('/wordcloud', auth, async (req, res) => {
  const { wordMap } = req.body;

  try{
    const pythonScript = spawn('python', ['../wordcloud.py']);

    pythonScript.stdin.write(JSON.stringify(wordMap));
    pythonScript.stdin.end();

    pythonScript.stderr.on('data', (data) => {
      console.error(`Python script error: ${data.toString()}`);
    });

    let imageData = [];
    pythonScript.stdout.on('data', (data) => {
      imageData.push(data);
    });

    pythonScript.on('close', (code) => {
      if(code === 0 ){
        const buffer = Buffer.concat(imageData);
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': buffer.length
        });
        res.end(buffer);
      } else {
        res.status(500).json({ error: 'Failed to generate word cloud' });
      }
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

module.exports = router;