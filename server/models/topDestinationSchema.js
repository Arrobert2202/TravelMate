const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topDestinationSchema = new Schema(
  {
    country: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    attractions: {
      type: String
    }
  }
);

const TopDestination = mongoose.model('TopDestination', topDestinationSchema);
module.exports = TopDestination;