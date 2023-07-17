const Note = require('../models/nodeModel');

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