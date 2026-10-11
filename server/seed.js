import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Post, Comment, Notification } from "./models/index.js";
await mongoose.connect(
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/connecthub",
);
if (await User.exists({ email: "maya@example.com" })) {
  console.log("Demo account already exists; seed skipped.");
  await mongoose.disconnect();
  process.exit(0);
}
const hash = await bcrypt.hash("ConnectHub123!", 12);
const users = await User.create([
  {
    username: "maya",
    email: "maya@example.com",
    displayName: "Maya Chen",
    bio: "Designing things that bring people together.",
    password: hash,
  },
  {
    username: "jordan",
    email: "jordan@example.com",
    displayName: "Jordan Lee",
    bio: "Frontend developer · coffee enthusiast",
    password: hash,
  },
  {
    username: "amara",
    email: "amara@example.com",
    displayName: "Amara Okafor",
    bio: "Building community through creativity.",
    password: hash,
  },
]);
users[0].following = [users[1]._id, users[2]._id];
users[1].followers = [users[0]._id];
users[2].followers = [users[0]._id];
await Promise.all(users.map((u) => u.save()));
const posts = await Post.create([
  {
    author: users[1]._id,
    content:
      "A little reminder to make room for the ideas that do not fit in the box. What are you working on this week?",
  },
  {
    author: users[2]._id,
    content:
      "Sunday market finds and a fresh notebook. Ready to turn a few sketches into something real ✨",
  },
  {
    author: users[0]._id,
    content:
      "Hello ConnectHub! Excited to share what I am building with this community.",
  },
]);
posts[0].likes.addToSet(users[0]._id, users[2]._id);
users[0].savedPosts.addToSet(posts[1]._id);
await Promise.all([posts[0].save(), users[0].save()]);
await Comment.create({
  post: posts[0]._id,
  author: users[0]._id,
  content: "Needed this today. Thanks for sharing!",
});
await Notification.create({
  recipient: users[0]._id,
  actor: users[1]._id,
  kind: "follow",
  message: "Jordan Lee started following you",
  read: false,
});
console.log("Seed complete. Demo login: maya@example.com / ConnectHub123!");
await mongoose.disconnect();
