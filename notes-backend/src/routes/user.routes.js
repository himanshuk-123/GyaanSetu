const express = require('express');
const {
  updateProfile,
  changePassword,
  getUserNotes,
  getBookmarkedNotes,
  followUser,
  getUserProfile
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Update user profile
router.put('/profile', protect, upload.single('avatar'), updateProfile);

// Change password
router.put('/password', protect, changePassword);

// Get user's notes
router.get('/notes', protect, getUserNotes);

// Get user's bookmarked notes
router.get('/bookmarks', protect, getBookmarkedNotes);

// Follow or unfollow a user
router.post('/:id/follow', protect, followUser);

// Get user profile with stats
router.get('/:id', getUserProfile);

module.exports = router; 