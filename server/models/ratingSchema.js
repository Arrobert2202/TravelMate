const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  country: {
    type: String,
    required: true
  },
  state: {
    required: String,
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
  description: [{
    word: {
      type: String,
    }
  }]
});

const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;