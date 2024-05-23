const express = require('express');
const router = express.Router();
const Group = require('../models/groupSchema');
const User = require('../models/userSchema');  
const auth = require('../middleware/auth');

router.post('/create', auth, async (req, res) => {
  const { name, country, state, city, members, admins} = req.body;

  try{
    const user = req.user._id;

    const allMembers = [...members, {user: user, unreadMessages: 0}];

    const newGroup = new Group({
      name,
      destination: {
        country,
        state,
        city
      },
      members: allMembers,
      admins: admins
    });
    
    const savedGroup = await newGroup.save();

    res.status(201).json(savedGroup);
  } catch(error){
    console.error(error);
    res.status(500).json({ error: 'Failed to create the group.'});
  }
});

router.get('/user-groups', auth, async (req, res) => {
  try{
    const user = await User.findById(req.user._id).populate('groups');
    if(!user){
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user.groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to get user's groups.` });
  }
});

module.exports = router;