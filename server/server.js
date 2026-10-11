import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "node:path";
import http from "node:http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import api from "./routes/api.js";
import messages from "./routes/messages.js";
import { User } from "./models/index.js";
const app = express(),
  port = process.env.PORT || 5001,
  dir = path.dirname(fileURLToPath(import.meta.url)),
  origin = process.env.CLIENT_URL || "http://localhost:5173";
const server = http.createServer(app),
  io = new Server(server, {
    cors: { origin, methods: ["GET", "POST", "PUT", "DELETE"] },
  });
app.set("io", io);
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "connecthub-development-secret",
    );
    const user = await User.findById(payload.id).select("_id");
    if (!user) return next(new Error("Account not found"));
    socket.userId = String(user._id);
    next();
  } catch {
    next(new Error("Invalid session"));
  }
});
io.on("connection", (socket) => socket.join("user:" + socket.userId));
app.use(cors({ origin }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(dir, "uploads")));
app.use("/api", api);
app.use("/api/messages", messages);
app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "ConnectHub API" }),
);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid resource ID" });
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(413).json({ message: "Image must be smaller than 5 MB" });
  if (err.code === 11000)
    return res
      .status(409)
      .json({ message: "Username or email is already registered" });
  if (err.name === "ValidationError")
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((x) => x.message)
        .join(", "),
    });
  res.status(500).json({ message: "Something went wrong. Please try again." });
});
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/connecthub")
  .then(() =>
    server.listen(port, () =>
      console.log("ConnectHub API listening on " + port),
    ),
  )
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });
