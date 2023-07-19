const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
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

const Note = mongoose.model('Node', noteSchema);

module.exports = Note;
