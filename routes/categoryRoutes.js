const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// API route to create a new category
router.post('/categories', categoryController.createCategory);

// API route to get all categories
router.get('/categories', categoryController.getAllCategories);

module.exports = router;
