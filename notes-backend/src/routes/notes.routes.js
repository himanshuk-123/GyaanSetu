const express = require('express');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  likeNote,
  bookmarkNote,
  downloadNote
} = require('../controllers/notes.controller');
const {
  addComment,
  getComments,
  deleteComment
} = require('../controllers/comment.controller');
const { protect, isOwner } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const Note = require('../models/note.model');

const router = express.Router();

// Get all notes & create a new note
router.route('/')
  .get(getNotes)
  .post(protect, upload.single('file'), createNote);

// Get, update, delete note by ID
router.route('/:id')
  .get(getNoteById)
  .put(protect, isOwner(Note), updateNote)
  .delete(protect, isOwner(Note), deleteNote);

// Like a note
router.put('/:id/like', protect, likeNote);

// Bookmark a note
router.put('/:id/bookmark', protect, bookmarkNote);

// Download a note
router.get('/:id/download', downloadNote);

// Comment routes
router.route('/:noteId/comments')
  .get(getComments)
  .post(protect, addComment);

router.delete('/:noteId/comments/:commentId', protect, deleteComment);

module.exports = router; 