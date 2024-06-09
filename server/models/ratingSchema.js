const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  attraction: {
    type: String,
    required: true
  },
  description: {
    type: [String],
    required: true
  },
  rating: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;