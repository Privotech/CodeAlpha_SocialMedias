import { Router } from 'express';
import mongoose from 'mongoose';
import { auth } from '../middleware/auth.js';
import { User, Notification } from '../models/index.js';
import { Conversation, Message } from '../models/messaging.js';
const router = Router();
const valid = id => mongoose.isValidObjectId(id);
const member = (conversation, userId) => conversation.participants.some(id => id.equals(userId));
const emitToUsers = (req, userIds, event, payload) => {
  const io = req.app.get('io');
  if (!io) return;
  for (const id of userIds) io.to('user:' + id.toString()).emit(event, payload);
};
router.use(auth);

router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('participants', 'username displayName avatar')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username displayName avatar' } });
    const result = await Promise.all(conversations.map(async conversation => {
      const other = conversation.participants.find(person => !person._id.equals(req.user._id));
      const unreadCount = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      });
      return { ...conversation.toObject(), other, unreadCount };
    }));
    res.json({ conversations: result });
  } catch (error) { next(error); }
});

router.post('/conversations', async (req, res, next) => {
  try {
    const userId = String(req.body.userId || '');
    if (!valid(userId)) return res.status(400).json({ message: 'Choose a valid person to message' });
    if (userId === String(req.user._id)) return res.status(400).json({ message: 'You cannot start a conversation with yourself' });
    const other = await User.findById(userId).select('username displayName avatar');
    if (!other) return res.status(404).json({ message: 'Person not found' });
    const pair = [String(req.user._id), String(other._id)].sort();
    let conversation;
    try {
      conversation = await Conversation.findOneAndUpdate(
        { pairKey: pair.join(':') },
        { $setOnInsert: { participants: pair, pairKey: pair.join(':') } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      conversation = await Conversation.findOne({ pairKey: pair.join(':') });
    }
    await conversation.populate('participants', 'username displayName avatar');
    const counterpart = conversation.participants.find(person => !person._id.equals(req.user._id));
    res.status(201).json({ conversation: { ...conversation.toObject(), other: counterpart, unreadCount: 0 } });
  } catch (error) { next(error); }
});

router.get('/conversations/:id/messages', async (req, res, next) => {
  try {
    if (!valid(req.params.id)) return res.status(400).json({ message: 'Invalid conversation' });
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!member(conversation, req.user._id)) return res.status(403).json({ message: 'You cannot access this conversation' });
    const before = req.query.before ? new Date(req.query.before) : null;
    if (before && Number.isNaN(before.getTime())) return res.status(400).json({ message: 'Invalid message cursor' });
    const filter = { conversation: conversation._id, ...(before ? { createdAt: { $lt: before } } : {}) };
    const messages = await Message.find(filter).sort({ createdAt: -1 }).limit(60).populate('sender', 'username displayName avatar');
    const unreadIds = messages.filter(message => !message.sender._id.equals(req.user._id) && !message.readBy.some(id => id.equals(req.user._id))).map(message => message._id);
    if (unreadIds.length) {
      await Message.updateMany({ _id: { $in: unreadIds } }, { $addToSet: { readBy: req.user._id } });
      emitToUsers(req, conversation.participants, 'message:read', { conversationId: String(conversation._id), readerId: String(req.user._id), messageIds: unreadIds.map(String) });
    }
    res.json({ messages: messages.reverse() });
  } catch (error) { next(error); }
});

router.post('/conversations/:id/messages', async (req, res, next) => {
  try {
    if (!valid(req.params.id)) return res.status(400).json({ message: 'Invalid conversation' });
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ message: 'Write a message first' });
    if (content.length > 4000) return res.status(400).json({ message: 'Messages can be up to 4,000 characters' });
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!member(conversation, req.user._id)) return res.status(403).json({ message: 'You cannot message this person' });
    const message = await Message.create({ conversation: conversation._id, sender: req.user._id, content, readBy: [req.user._id] });
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();
    await message.populate('sender', 'username displayName avatar');
    const payload = { conversationId: String(conversation._id), message: message.toObject() };
    emitToUsers(req, conversation.participants, 'message:new', payload);
    const recipient = conversation.participants.find(id => !id.equals(req.user._id));
    const notification = await Notification.create({
      recipient, actor: req.user._id, kind: 'message',
      message: req.user.displayName + ' sent you a message',
      target: conversation._id
    });
    emitToUsers(req, [recipient], 'notification:new', notification.toObject());
    res.status(201).json({ message: message.toObject() });
  } catch (error) { next(error); }
});

router.put('/conversations/:id/read', async (req, res, next) => {
  try {
    if (!valid(req.params.id)) return res.status(400).json({ message: 'Invalid conversation' });
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!member(conversation, req.user._id)) return res.status(403).json({ message: 'You cannot access this conversation' });
    const result = await Message.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    emitToUsers(req, conversation.participants, 'message:read', { conversationId: String(conversation._id), readerId: String(req.user._id) });
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) { next(error); }
});
export default router;
