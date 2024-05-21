const express = require('express');
const router = express.Router();
const Group = require('../models/groupSchema');
 
router.post('/create', async (req, res) => {
  try{
    const { name, members, destination, admins} = req.body;

    const newGroup = new Group({
      name,
      members,
      destination,
      messages,
      admins
    });
    
    const savedGroup = await newGroup.save();

    res.status(201).json(savedGroup);
  } catch(error){
    console.error(error);
    res.status(500).json({ error: 'Failed to create the group.'});
  }
});

router.get('/user-groups', async (req, res) => {});