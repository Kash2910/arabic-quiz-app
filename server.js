import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());

// Serve static files from the root folder
app.use(express.static(__dirname));

let users = [];

// POST: Create a new user
app.post('/users', (req, res, next) => {
  try {
    const { fName, lName, age } = req.body;
    const newUser = { id: uuidv4(), fName, lName, age };
    users.push(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

// GET: Retrieve all users
app.get('/users', (req, res, next) => {
  try {
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

// GET: Retrieve a specific user
app.get('/users/:id', (req, res, next) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// PUT: Update a user
app.put('/users/:id', (req, res, next) => {
  try {
    const { fName, lName, age } = req.body;
    const userIndex = users.findIndex(user => user.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).send("User not found");
    }
    users[userIndex] = { id: req.params.id, fName, lName, age };
    res.status(200).json(users[userIndex]);
  } catch (err) {
    next(err);
  }
});

// DELETE: Remove a user
app.delete('/users/:id', (req, res, next) => {
  try {
    const userIndex = users.findIndex(user => user.id === req.params.id);
    if (userIndex === -1) {
      return res.status(404).send("User not found");
    }
    users.splice(userIndex, 1);
    res.status(200).send("User deleted");
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong");
});

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
