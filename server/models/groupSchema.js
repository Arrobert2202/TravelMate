const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String
  },
  unreadMessages: {
    type: Number,
    default: 0
  }
}, { _id: false });


const authorSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String
  }
}, { _id: false });

const messageSchema = new Schema({
  author: {
    type: authorSchema,
    required: false
  },
  content: {
    type: String
  },
  imageUrl: {
    type: String
  },
  type: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const groupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  members: [memberSchema],
  destination: {
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
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  messages: [messageSchema],
  admins: [{
    id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String
  }
}],
  lastModified: {
    type: Date,
    default: Date.now
  }
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
