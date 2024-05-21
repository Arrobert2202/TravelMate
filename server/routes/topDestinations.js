const express = require('express');
const router = express.Router();
const TopDestination = require('../models/topDestinationSchema');
const auth = require('../middleware/auth');

router.post('/', async (req, res) =>{
  try{
    const { country, city, image, attractions} = req.body;

    const attractionsValue = attractions ? attractions : 'No attractions found';

    const newDestination = new TopDestination({
      country,
      city,
      image,
      attractions
    });
    const savedDestination = await newDestination.save();

    res.status(201).json(savedDestination);
  } catch(error){
    res.status(500).json({error: error.message});
  }
});

router.get('/', auth, async (req, res) => {
  try{
    const destionations = await TopDestination.find();

    res.status(200).json(destionations);
  } catch(error){
    res.status(500).json({error: error.message});
  }
});

module.exports = router;