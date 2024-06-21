const express = require('express');
const router = express.Router();
const TopDestination = require('../models/topDestinationSchema');
const auth = require('../middleware/auth');
const axios = require('axios');
const { spawn } = require('child_process');
require("dotenv").config();
const fs = require('fs');

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

router.get('/top-destinations', async (req, res) => {
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
    const states = response.data.data.states.map(state => state.name);
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

router.post('/attractions', auth, async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).send({ error: 'City is required' });
  }

  try{
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${city}+point+of+interest`)}&language=en&key=${process.env.GOOGLE_API_KEY}`);
    if (response.data.status !== 'OK'){
      return res.status(500).send({error: 'Error fetching data from Places API'});
    }

    const attractions = response.data.results.map(attraction => {
      const { formatted_address, name, photos, rating, user_ratings_total} = attraction;

      const photoUrl = photos && photos.length > 0 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}` : null;
      return {
        name,
        address: formatted_address,
        rating,
        user_ratings_total,
        photoUrl
      };
    });

    res.status(200).json(attractions);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.post('/attractions/name', auth, async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).send({ error: 'City is required' });
  }

  try{
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${city}+point+of+interest`)}&language=en&key=${process.env.GOOGLE_API_KEY}`);
    if (response.data.status !== 'OK'){
      return res.status(500).send({error: 'Error fetching data from Places API'});
    }

    const attractions = response.data.results.map(attraction => {
      const { name } = attraction;
      return {
        name
      };
    });

    res.status(200).json(attractions);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.post('/attractions/route', auth, async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).send({ error: 'City is required' });
  }

  try{
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${city}+point+of+interest`)}&language=en&key=${process.env.GOOGLE_API_KEY}`);
    if (response.data.status !== 'OK'){
      return res.status(500).send({error: 'Error fetching data from Places API'});
    }
    
    const attractions = response.data.results.map(attraction => {
      const { formatted_address, name, geometry, photos } = attraction;

      const photoUrl = photos && photos.length > 0 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}` : null;
      return {
        name,
        address: formatted_address,
        lat: geometry.location.lat,
        lng: geometry.location.lng,
        photoUrl
      };
    });
    
    const pythonInputData = attractions.map(({ name, address, lat, lng }) => ({
      name,
      address,
      lat,
      lng
    }));
    console.log("python data: ", JSON.stringify(pythonInputData));
    const pythonScript = spawn('python', ['./algorithm.py']);  

    pythonScript.stdin.write(JSON.stringify(pythonInputData));
    pythonScript.stdin.end();
    
    pythonScript.stderr.on('data', (data) => {
      console.error(`Python script error: ${data.toString()}`);
    });

    let attractionsJson = '';
    pythonScript.stdout.on('data', (data) => {
      attractionsJson += data.toString();;
    })

    pythonScript.on('close', (code) => {
      if(code === 0){
        const route = JSON.parse(attractionsJson);
        const routeAttractions = route.map(r => {
          return attractions.find(attraction => attraction.lat === r.lat && attraction.lng === r.lng);
        });
        console.log("route: ", routeAttractions);
        res.status(200).json(routeAttractions);
      }
      else{ 
        return res.status(500).json({error: "failed to create route"});
      }
    })
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

module.exports = router;