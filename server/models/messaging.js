import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  pairKey: { type: String, unique: true, required: true, index: true },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null }
}, { timestamps: true });
conversationSchema.index({ participants: 1, updatedAt: -1 });
const messageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 4000 },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
messageSchema.index({ conversation: 1, createdAt: -1 });
export const Conversation = mongoose.models.Conversation || model('Conversation', conversationSchema);
export const Message = mongoose.models.Message || model('Message', messageSchema);
