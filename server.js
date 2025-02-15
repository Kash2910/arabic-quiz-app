import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing; tighten this in production
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Explicitly specify transports
});

// Your existing routes and logic...

const PORT = process.env.PORT || 2000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});