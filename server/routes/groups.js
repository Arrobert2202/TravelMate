const express = require('express');
const router = express.Router();
const Group = require('../models/groupSchema');
const User = require('../models/userSchema');  
const auth = require('../middleware/auth'); 
const supabase = require('../middleware/supabase');
const { decode } = require('base64-arraybuffer');
const upload = require('../middleware/multerConfig');

router.post('/create', auth, async (req, res) => {
  const { name, country, state, city, address, coordinates, members, message, admins } = req.body;

  try{
    const userId = req.user._id.toString();

    const allMembers = members.map(member => {
      return {
        userId: member.userId,
        username: member.username,
        unreadMessages: member.userId === userId ? 0 : 1 
      };
    });

    const newGroup = new Group({
      name,
      destination: {
        country,
        state,
        city
      },
      location: {
        address,
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng
        }
      },
      members: allMembers,
      messages: [{
        author: null,
        content: message,
        type: "text",
        date: new Date()
      }], 
      admins: admins
    });
    
    const savedGroup = await newGroup.save();

    const userIds = allMembers.map(member => member.userId);
    await User.updateMany(
      { _id: { $in: userIds } },
      { $push: { groups: savedGroup._id } }
    );

    res.status(201).json(savedGroup);
  } catch(error){
    console.error(error);
    res.status(500).json({ error: 'Failed to create the group.'});
  }
});

router.get('/user-groups', auth, async (req, res) => {
  try{
    const user = await User.findById(req.user._id).populate({
      path: 'groups',
      select: 'name destination members lastModified',
      populate: {
        path: 'messages',
        options: { sort: {date: -1}, limit: 1}
      }
    });

    if(!user){
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user.groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to get user's groups.` });
  }
});

router.get('/:id', auth, async (req, res) => {
  const groupId = req.params.id;
  console.log(`group id: ${groupId}`);
  try{
    const group = await Group.findById(groupId).select('name destination location members admins lastModified').populate({
      path: 'messages',
      options: { sort: { 'date': -1}, limit: 20}
    });

    if(!group){
      return res.status(404).json({ error: 'Group not found'});
    }
    res.status(200).json(group);
  } catch(error){
    console.error(error);
    res.status(500).json({ error: `Failed to get group with id:${groupId}.` });
  }
});

router.post('/:id/update', auth, async (req, res) => {
  const groupId = req.params.id;
  const { name, destination, location, members, admins } = req.body;
  const updatedGroup = { name, destination, location, members, admins };
  try{
    const group = await Group.findByIdAndUpdate( groupId, { $set: updatedGroup}, {new: true, runValidators: true});
    if(!group){
      return res.status(404).json({ error: 'Group not found'});
    }
    res.status(200).json(group);
  } catch (error){
    console.error(error);
    res.status(500).json({ error: `Failed to get group with id:${groupId}.` });
  }
});

router.get('/:id/messages', auth, async (req, res) => {
  try{
    const groupId = req.params.id;
    const { skip = 0, limit = 20 } = req.query;

    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({ error: 'Group not found'});
    }

    const messages = group.messages.sort((a, b) => b.date - a.date)
                          .slice(skip, skip + limit);

    res.status(200).json(messages);
  } catch (error){
    console.error(error);
    res.status(500).json({error: 'Failed to get messages.'});
  }
});

router.post('/:id/message', auth, async(req, res) => {
  const groupId = req.params.id;
  const { content, type, imageUrl } = req.body;

  try{
    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({ error: 'Group not found'});
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newMessage = {
      author: {
        id: req.user._id,
        username: user.username
      },
      content,
      type,
      imageUrl,
      date: new Date(),
    };

    for (const member of group.members){
      if(member.userId.toString() !== req.user._id.toString()){
        member.unreadMessages += 1;
      }
    }

    group.messages.push(newMessage);
    group.lastModified = new Date();
    await group.save();

    res.status(201).json(newMessage);
  } catch (error){
    console.error(error);
    res.status(500).json({error: 'Failed to send message.'});
  }
});

router.post('/:id/message/image', upload.single('image'), auth, async(req, res) => {
  const groupId = req.params.id;

  try{
    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({ error: 'Group not found'});
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const image = req.file;
    if(!image){
      return res.status(404).json({ message: 'Upload a file'});
    }
    
    const imageBase64 = decode(image.buffer.toString("base64"));
    const { data, error } = await supabase.storage
      .from("images")
      .upload(image.originalname, imageBase64, {
        contentType: "image/png",
      });
    
    const { data: imageFile} = supabase.storage
      .from("images")
      .getPublicUrl(data.path);

    const newMessage = {
      author: {
        id: req.user._id,
        username: user.username
      },
      content: "",
      type: "image",
      imageUrl: imageFile.publicUrl,
      date: new Date(),
    };

    for (const member of group.members){
      if(member.userId.toString() !== req.user._id.toString()){
        member.unreadMessages += 1;
      }
    }

    group.messages.push(newMessage);
    group.lastModified = new Date();
    await group.save();

    console.log(imageFile.publicUrl);
    res.status(201).json(newMessage);
  } catch (error){
    console.error(error);
    res.status(500).json({error: 'Failed to send message.'});
  }
});

router.post('/:id/messages/read', auth, async (req, res) => {
  const groupId = req.params.id;

  try{ 
    const group = await Group.findById(groupId);
    if(!group){
      return res.status(404).json({ error: 'Group not found'});
    }

    const user = group.members.find(member => member.userId.toString() === req.user._id.toString());
    if (user) {
      console.log("marcam ca citit");
      user.unreadMessages = 0;
    }
    await group.save();
    res.status(201);
  } catch (error){
    console.error(error);
    res.status(500).json({error: 'Failed to mark messages as read.'});
  }
});

module.exports = router;