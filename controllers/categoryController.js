const Category = require('../models/category');

// Controller function to create a new category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        // Create a new category
        const newCategory = new Category({ name });
        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller function to get all categories
exports.getAllCategories = async (req, res) => {
    try {
        // Fetch all categories from the database
        const categories = await Category.find().exec();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
