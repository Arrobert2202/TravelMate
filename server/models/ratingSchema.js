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
    type: Map,
    of: Number,
    required: true
  },
  rating: {
    type: String,
    required: true
  },
  users: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  count: { 
    type: Number,
    default: 0
  }
});

ratingSchema.index({attraction: 'text'});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;