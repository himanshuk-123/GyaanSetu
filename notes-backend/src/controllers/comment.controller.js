const Comment = require('../models/comment.model');
const Note = require('../models/note.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Helper function to create notifications
const createNotification = async (userId, message) => {
  try {
    await Notification.create({ user: userId, message });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Add a comment to a note
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const noteId = req.params.noteId;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }
    
    // Find the note
    const note = await Note.findById(noteId)
      .populate('author', 'name followers');
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id,
      note: noteId
    });
    
    // Populate author info
    await comment.populate('author', 'name avatar');
    
    // Create notification for note author if it's not the user themselves
    if (note.author._id.toString() !== req.user._id.toString()) {
      await createNotification(
        note.author._id,
        `${req.user.name} commented on your note "${note.title.substring(0, 30)}${note.title.length > 30 ? '...' : ''}"`
      );
    }
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get comments for a note
exports.getComments = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalComments = await Comment.countDocuments({ note: noteId });
    
    const comments = await Comment.find({ note: noteId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatar');
    
    res.status(200).json({
      success: true,
      count: comments.length,
      total: totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }
    
    await comment.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 