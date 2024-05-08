const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name:{
      type: String,
      required: true
    },
    description:{
      type: String
    },
    members:[{
      type : Schema.Types.ObjectId,
      ref: 'User'
    }],
    destination: {
      type: String,
      required: true
    },
    messages: [{
      author: {
        type : Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    admins: [{
      type : Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
);

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;