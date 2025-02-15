import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json()); // Use built-in JSON middleware
app.use(express.static(path.join(__dirname, 'public')));

// Global variables to hold quiz data
global.words = [];   // Array of Arabic words
global.answers = {}; // Object to store user answers keyed by username

// POST: Admin posts words
app.post('/post-words', (req, res) => {
  // Log the request body for debugging
  console.log("Received POST /post-words with body:", req.body);

  const { words } = req.body;
  if (!words) {
    return res.status(400).json({ error: "Missing 'words' in request body" });
  }
  global.words = words;
  global.answers = {}; // Reset previous answers
  io.emit("newWords", words); // Notify all connected clients
  res.json({ message: "Words posted successfully" });
});

// GET: Retrieve posted words
app.get('/get-words', (req, res) => {
  res.json({ words: global.words });
});

// POST: User submits their answers
app.post('/submit-answer', (req, res) => {
  const { username, userAnswers } = req.body;
  global.answers[username] = userAnswers;
  io.emit("newAnswer", { username, userAnswers });
  res.json({ message: "Answers submitted" });
});

// GET: Retrieve results (for admin review)
app.get('/get-results', (req, res) => {
  res.json(global.answers);
});

// POST: Clear the test session
app.post('/clear', (req, res) => {
  global.words = [];
  global.answers = {};
  io.emit("testCleared");
  res.json({ message: "Test cleared" });
});

// Setup Socket.io with proper CORS and transports
const io = new Server(server, {
  cors: {
    origin: "*", // For testing; tighten in production
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  // Send current words when a client connects
  socket.emit("newWords", global.words);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 2000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
