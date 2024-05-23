const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');

router.post('/validate', async (req, res) => {
  const { username } =req.body;

  try{
    const user = await User.findOne({ username });

    if(user){
      res.status(200).json({ exists: true, userId: user._id});
    } else {
      res.status(200).json({exists: false});
    }
  } catch(error) {
    console.error('Error validating user: ', error);
    res.status(500).json({message: 'Server error'});
  }
});

module.exports = router;