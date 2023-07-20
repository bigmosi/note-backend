const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/authMiddleware');
const { promisify } = require('util');

const secretKey = process.env.SECRET_KEY || 'default_secret_key';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User login
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  try {
    const token = jwt.sign({ userId: req.user._id }, secretKey);
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', verifyAccessToken, async (req, res) => {
  try {
    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization header' });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Use promisify to convert jwt.verify into a promise-based function
    const verifyTokenAsync = promisify(jwt.verify);

    // Verify the access token and get the decoded token payload
    const decodedToken = await verifyTokenAsync(accessToken, secretKey);

    // Get the user ID from the decoded token
    const userId = decodedToken.userId;

    // Find the user in the database by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear the access token from the user's record in the database
    user.accessToken = null;
    await user.save();

    // Respond with a success message or status code
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
