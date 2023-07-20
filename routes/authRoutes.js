const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/authMiddleware');
const { promisify } = require('util');

const secretKey = process.env.SECRET_KEY || 'default_secret_key';

// Register a new user
router.post(
    '/register',
    [
      body('username')
          .notEmpty()
          .withMessage('Username is required')
          .isLength({ min: 5 })
          .withMessage('Username must be at least 5 characters long')
          .trim(),

      body('email')
          .notEmpty()
          .withMessage('Email is required')
          .isEmail()
          .withMessage('Invalid email format')
          .normalizeEmail(),

      body('password')
          .notEmpty()
          .withMessage('Password is required')
          .isLength({ min: 8 })
          .withMessage('Password must be at least 8 characters long')
          .trim(),
    ],
    async (req, res) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract user data from the request body
      const { username, email, password } = req.body;

      try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance using the User model
        const newUser = new User({ username, email, password: hashedPassword });

        // Save the user to the database
        await newUser.save();

        // User registration successful
        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
);

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

    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.accessToken = null;
    await user.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
