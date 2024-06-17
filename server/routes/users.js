const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

router.post('/validate', async (req, res) => {
  const { username } = req.body;

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

router.get('/', auth, async (req, res) => {
  try{
    const { username, email } = req.user;
    
    res.status(200).json({ username, email });
  } catch(error){
    console.error('Error getting the user: ', error);
    res.status(500).json({message: 'Server error'});
  }
});

router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try{
    const user = await User.findById(req.user._id);
    if(!user){
      return res.status(404).json('User not found');
    }

    const passwordMatch = await user.comparePassword(currentPassword);
    if(!passwordMatch){
      return res.status(404).json('Password not match');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json('Password changed successfully');
  } catch  (error){
    console.error('Error changing the password: ', error);
    res.status(500).json({message: 'Server error'});
  }
});

router.delete('/delete-account', auth, async (req, res) => {
  try{
    const user = await User.findByIdAndDelete(req.user._id);
    if(!user){
      return res.status(404).json('User not found');
    }

    res.status(200).json('User deleted');
  } catch  (error){
    console.error('Error deleting the account: ', error);
    res.status(500).json({message: 'Server error'});
  }
});

module.exports = router;