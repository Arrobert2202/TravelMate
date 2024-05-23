const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  unreadMessages: {
    type: Number,
    default: 0
  }
}, { _id: false });


const messageSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String
  },
  link: {
    type: String
  },
  image: {
    data: Buffer,
    contentType: String
  },
  type: {
    type: String,
    enum: ['text', 'image', 'link'],
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
  messages: [messageSchema],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
