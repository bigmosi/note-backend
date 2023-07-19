const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    notes: [{
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }],
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
