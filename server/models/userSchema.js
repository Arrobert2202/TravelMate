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
    }
  }
);

// userSchema.pre('save', async function (next){
//   const user = this;
//   if (!user.isModified('password')) return next();

//   try{
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     next();
//   } catch (error){
//     return next(error);
//   }
// });

userSchema.methods.comparePassword = async function(password){
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;