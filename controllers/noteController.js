const Note = require('../models/nodeModel');
const mongoose = require('mongoose');

exports.createNote = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const newNote = await  Note.create({
            title,
            content,
            category,
            tags
        });

        await newNote.save();

        res.status(201).json({ success: true, data: newNote });
    } catch (error) {
      res.status(500).json({ error: 'Could not create the note.'});
    }
}

exports.getAllNotes = async (req, res) => {
    try {
        const notes = await  Note.find();
        res.status(200).json({ success: true, data: notes  })

    } catch (error) {
      res.status(500).json({ error:  'Could not fetch notes'});
    }
}

// Controller to organize a note into a category

exports.organizeNoteIntoCategory = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { category } = req.body;
        const note = await Note.findByIdAndUpdate(noteId, { category }, {
            new: true
        });
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ error: 'Could not organize note into category.' })
    }
}

// Controller to add tags to a note
exports.addTagsToNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { tags } = req.body;
        const note = await Note.findByIdAndUpdate(
            noteId,
            { $addToSet: { tags: { $each: tags}} },
            { new: true }
        );
        if(!note) {
            return res.status(404).json({ error: 'Note not found.' });
        }

        res.status(200).json({ success: true, data: note });
    } catch (error) {
       res.status(500).json({ error: 'Could not add tags to note.' })
    }
}

// Controller to reorder notes within a category
exports.reorderNotesWithinCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { noteIds } = req.body;
        const updatedNotes = await Promise.all(
            noteIds.map((noteId, index) =>
                Note.findByIdAndUpdate(noteId, { category: categoryId, order: index })

        ));
        res.status(200).json({ success: true, data: updatedNotes });
    } catch (error) {
        res.status(500).json({ error: 'Could not reorder notes within the category.' });
    }
}

// PUT /api/v1/categories/:categoryId/notes/reorder
exports.reorderNotes = async (req, res) => {
    const { categoryId } = req.params;
    const { order } = req.body;

    try {
        // Check if the order array contains valid ObjectId strings
        if (!Array.isArray(order) || order.some((noteId) => !mongoose.isValidObjectId(noteId))) {
            return res.status(400).json({ success: false, error: 'Invalid noteId(s) in the order array.' });
        }

        // Convert the note IDs from strings to ObjectIds
        const noteIds = order.map((noteId) => new mongoose.Types.ObjectId(noteId));

        // Find the notes that belong to the specified category and have the provided noteIds
        const notesToUpdate = await Note.find({ _id: { $in: noteIds }, category: categoryId });

        // Create a map of noteIds to their corresponding order positions
        const noteOrderMap = {};
        noteIds.forEach((noteId, index) => {
            noteOrderMap[noteId] = index;
        });

        // Update the order field of each note in the category based on the noteOrderMap
        await Promise.all(
            notesToUpdate.map(async (note) => {
                const noteId = note._id.toString();
                note.order = noteOrderMap[noteId];
                await note.save();
            })
        );

        res.json({ success: true, message: 'Notes reordered successfully.' });
    } catch (error) {
        console.error('Error updating note order:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Controller to share a note with other users

exports.shareNote = async (req, res) => {
    const { noteId } = req.params;
    const { sharedWith } = req.body;

    try {
        const note = await Note.findById(noteId);

        // Check if the current user is the owner of the note
        if (!note || note.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'You are not the owner of this note.' });
        }

        // Add the sharedWith users to the sharedWith array in the note
        note.sharedWith.push(...sharedWith);

        // Save the updated note
        await note.save();
        return res.json({ message: 'Note shared successfully.' });
    } catch (error) {
        console.error('Error sharing note:', error);
        return res.status(500).json({ message: 'Failed to share the note. Please try again later.' });
    }
}