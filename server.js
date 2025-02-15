import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serves frontend files

let words = [];
let answers = {};

// Handle new words from admin page
app.post("/post-words", (req, res) => {
    words = req.body.words;
    answers = {};
    io.emit("newWords", words); 
    res.json({ message: "Words posted successfully" });
});

// Get words
app.get("/get-words", (req, res) => {
    res.json({ words });
});

// Handle user answers
app.post("/submit-answer", (req, res) => {
    const { username, userAnswers } = req.body;
    answers[username] = userAnswers;
    io.emit("newAnswer", { username, userAnswers });
    res.json({ message: "Answers submitted" });
});

// Get results for admin
app.get("/get-results", (req, res) => {
    res.json(answers);
});

// Clear test session
app.post("/clear", (req, res) => {
    words = [];
    answers = {};
    io.emit("testCleared");
    res.json({ message: "Test cleared" });
});

// Handle real-time connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.emit("newWords", words);
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
