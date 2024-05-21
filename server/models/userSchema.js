const jwt = require('jsonwebtoken');
require("dotenv").config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    email:{
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    groups: [{
      type: Schema.Types.ObjectId,
      ref: 'Group'
    }]
  }
);

userSchema.methods.comparePassword = async function(password){
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;