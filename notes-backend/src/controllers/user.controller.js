const User = require('../models/user.model');
const Note = require('../models/note.model');
const fs = require('fs');
const path = require('path');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    // Get user from database
    let user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    
    // If avatar is uploaded
    if (req.file) {
      // Delete old avatar if exists
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      // Set new avatar path
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password'
      });
    }
    
    // Find user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's notes
// @route   GET /api/users/notes
// @access  Private
exports.getUserNotes = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // Count total notes
    const total = await Note.countDocuments({ author: req.user._id });
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get user's notes with pagination
    const notes = await Note.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's bookmarked notes
// @route   GET /api/users/bookmarks
// @access  Private
exports.getBookmarkedNotes = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // Get user with bookmarks
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      options: {
        sort: { createdAt: -1 },
        skip: (parseInt(page) - 1) * parseInt(limit),
        limit: parseInt(limit)
      },
      populate: {
        path: 'author',
        select: 'name email avatar'
      }
    });
    
    const total = user.bookmarks.length;
    
    res.status(200).json({
      success: true,
      count: user.bookmarks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: user.bookmarks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Follow or unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
  try {
    // Can't follow yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    // Find the user to follow
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Find current user
    const currentUser = await User.findById(req.user._id);

    // Check if already following
    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow: remove from current user's following and from target user's followers
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: userToFollow._id } }
      );
      
      await User.findByIdAndUpdate(
        userToFollow._id,
        { $pull: { followers: req.user._id } }
      );

      // Create notification for unfollow
      await createNotification(
        userToFollow._id,
        `${currentUser.name} has unfollowed you.`
      );

      return res.status(200).json({
        success: true,
        isFollowing: false,
        message: `You have unfollowed ${userToFollow.name}`
      });
    } else {
      // Follow: add to current user's following and target user's followers
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { following: userToFollow._id } }
      );
      
      await User.findByIdAndUpdate(
        userToFollow._id,
        { $addToSet: { followers: req.user._id } }
      );

      // Create notification for follow
      await createNotification(
        userToFollow._id,
        `${currentUser.name} has started following you.`
      );

      return res.status(200).json({
        success: true,
        isFollowing: true,
        message: `You are now following ${userToFollow.name}`
      });
    }
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user profile with stats (for public viewing)
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-bookmarks -__v');
      
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Count notes by this user
    const notesCount = await Note.countDocuments({ author: user._id });
    
    // Check if the requesting user is following this user
    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      isFollowing = currentUser.following.includes(user._id);
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          notesCount,
          isFollowing
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to create notifications
const createNotification = async (userId, message) => {
  try {
    const Notification = require('../models/notification.model');
    await Notification.create({ user: userId, message });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}; 