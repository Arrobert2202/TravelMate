require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async() => {
  try{
    await mongoose.connect(process.env.MONGODB_URI, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true
    }).then(() => {
    console.log('Connected to mongodb');
    })
  } catch(error){
    console.error('Error connecting to mongodb: ', error)
  }
};

module.exports = connectDB;