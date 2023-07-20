const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// API route to create a new category
router.post('/categories', categoryController.createCategory);

// API route to get all categories
router.get('/categories', categoryController.getAllCategories);

// API route to get notes for a specific category
router.get('/categories/:categoryId/notes', categoryController.getNotesByCategory);


module.exports = router;
