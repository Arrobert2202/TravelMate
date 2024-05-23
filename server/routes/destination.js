const express = require('express');
const router = express.Router();
const TopDestination = require('../models/topDestinationSchema');
const auth = require('../middleware/auth');
const axios = require('axios');

router.post('/top-destinations', async (req, res) =>{
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

router.get('/top-destinations', auth, async (req, res) => {
  try{
    const destionations = await TopDestination.find();

    res.status(200).json(destionations);
  } catch(error){
    res.status(500).json({error: error.message});
  }
});


router.get('/countries', auth, async(req, res) => {
  try{
    const response = await axios.get('https://countriesnow.space/api/v0.1/countries');
    const countries = response.data.data.map(country => country.country);
    res.status(200).json(countries);
  } catch (error){
    res.status(500).json({error: error.message});
  }
});

router.post('/states', auth, async(req, res) => {
  const { country } = req.body;
  try{
    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/states', { country });
    const states = response.data.data.states.map(state => state.name);//.replace(/( County| State)$/, '')
    res.status(200).json(states);
  } catch (error){
    res.status(500).json({error: error.message});
  }
});

router.post('/cities', auth, async(req, res) => {
  const { country, state } = req.body;
  try{
    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', { country, state });
    const cities = response.data.data;
    res.status(200).json(cities);
  } catch (error){
    res.status(500).json({error: error.message});
  }
});

module.exports = router;