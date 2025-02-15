import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Global variables to hold quiz data (no database)
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing; tighten this in production
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Explicitly specify transports
});
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  // Send current words when a client connects
  socket.emit("newWords", global.words);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

global.words = []; // Array of Arabic words
global.answers = {}; // Object to store user answers keyed by username

// POST: Admin posts words
app.post("/post-words", (req, res) => {
  const { words } = req.body;
  global.words = words;
  global.answers = {}; // Reset any previous answers
  io.emit("newWords", words); // Notify all connected clients
  res.json({ message: "Words posted successfully" });
});

// GET: Retrieve posted words
app.get("/get-words", (req, res) => {
  res.json({ words: global.words });
});

// POST: User submits their answers
app.post("/submit-answer", (req, res) => {
  const { username, userAnswers } = req.body;
  global.answers[username] = userAnswers;
  io.emit("newAnswer", { username, userAnswers });
  res.json({ message: "Answers submitted" });
});

// GET: Retrieve results (for admin review)
app.get("/get-results", (req, res) => {
  res.json(global.answers);
});

// POST: Clear the test session
app.post("/clear", (req, res) => {
  global.words = [];
  global.answers = {};
  io.emit("testCleared");
  res.json({ message: "Test cleared" });
});

// Socket.io connection

const PORT = process.env.PORT || 2000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
