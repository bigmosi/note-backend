require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const noteRoutes = require('./routes/noteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const handleSocketEvents = require('./sockets/socketHandlers');
const passport = require('passport');
const passportConfig = require('./config/passportConfig');
const authRoutes = require('./routes/authRoutes')
const session = require('express-session');
const crypto = require('crypto');

const PORT = 4000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Generate a random session secret
const generateSessionSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

app.use(session({
  secret: generateSessionSecret(),
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Register the routes
app.use('/api/v1', noteRoutes);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1/auth', authRoutes);

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/bookstoreDB')
  .then(() => {
    console.log('Connected to MongoDB');

    // Start the HTTP server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Add the WebSocket event handlers
    handleSocketEvents(io);
  })
  .catch((error) => {
    console.log(error);
  });

const secretKey = process.env.SECRET_KEY || 'default_secret_key';