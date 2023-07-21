const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// API route to create a new note
router.post('/notes', noteController.createNote);

// API route to get all notes
router.get('/notes', noteController.getAllNotes);

// API route to organize notes into categories
router.put('/notes/:noteId/category', noteController.organizeNoteIntoCategory);

// API route to add tags to a note
router.put('/notes/:noteId/tags', noteController.addTagsToNote);

// router.put('/categories/:categoryId/reorder', noteController.reorderNotesWithinCategory);

router.put('/categories/:categoryId/notes/reorder', noteController.reorderNotes);

module.exports = router;
