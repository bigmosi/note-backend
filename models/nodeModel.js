const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    tags: [{
        type: String
    }],
    order: { type: Number, required: true, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Note = mongoose.model('Node', nodeSchema);

module.exports = Note;
