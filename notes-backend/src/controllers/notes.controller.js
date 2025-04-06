const path = require('path');
const fs = require('fs');
const Note = require('../models/note.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

// Function to create notifications
const createNotification = async (userId, message) => {
  try {
    await Notification.create({ user: userId, message });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get all notes
exports.getNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    
    const query = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add tags filter
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    const totalNotes = await Note.countDocuments(query);
    const totalPages = Math.ceil(totalNotes / limit);

    const notes = await Note.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get user's likes and bookmarks for UI state
    let userLikes = [];
    let userBookmarks = [];
    
    if (req.user) {
      const user = await User.findById(req.user._id).select('bookmarks');
      userBookmarks = user?.bookmarks || [];
      
      // Get notes liked by user
      const likedNotes = await Note.find({ likes: req.user._id }).select('_id');
      userLikes = likedNotes.map(note => note._id.toString());
    }
    
    // Transform notes with additional UI state info
    const notesWithStatus = notes.map(note => {
      const noteObj = note.toObject();
      return {
        ...noteObj,
        isLiked: userLikes.includes(noteObj._id.toString()),
        isBookmarked: userBookmarks.some(id => id.toString() === noteObj._id.toString()),
        likesCount: noteObj.likes?.length || 0
      };
    });
    
    res.status(200).json({
      data: notesWithStatus,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get a note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name avatar'
        }
      });
    
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    // Get bookmark and like status
    let isBookmarked = false;
    let isLiked = false;
    
    if (req.user) {
      const user = await User.findById(req.user._id).select('bookmarks');
      isBookmarked = user?.bookmarks?.some(id => id.toString() === note._id.toString()) || false;
      isLiked = note.likes.includes(req.user._id);
    }
    
    const noteWithStatus = {
      ...note.toObject(),
      isBookmarked,
      isLiked,
      likesCount: note.likes?.length || 0
    };
    
    res.status(200).json({ success: true, data: noteWithStatus });
  } catch (error) {
    console.error('Error getting note by ID:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }

    const note = await Note.create({
      title,
      description,
      filePath: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
      fileSize: req.file.size,
      author: req.user._id,
      tags: tagArray
    });

    // Populate author information
    await note.populate('author', 'name avatar');

    // Create notification for user who created the note
    await createNotification(req.user._id, `Your note "${title}" has been successfully uploaded.`);
    
    // Get user's followers and notify them about the new note
    const currentUser = await User.findById(req.user._id);
    if (currentUser.followers && currentUser.followers.length > 0) {
      // Notify followers about the new note
      for (const followerId of currentUser.followers) {
        await createNotification(
          followerId,
          `${currentUser.name} has uploaded a new note: "${title}"`
        );
      }
    }

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    
    // Update fields if provided
    if (title) note.title = title;
    if (description) note.description = description;
    if (tagArray) note.tags = tagArray;
    
    await note.save();
    
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    // Delete file if it exists
    if (note.filePath) {
      const filePath = path.join(__dirname, '..', '..', note.filePath);
      fs.unlink(filePath, err => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await note.deleteOne();
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Like a note
exports.likeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    // Check if user already liked the note
    const alreadyLiked = note.likes.includes(req.user._id);
    
    if (alreadyLiked) {
      // Unlike
      note.likes = note.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like
      note.likes.push(req.user._id);
      
      // Create notification for note author if it's not the user themselves
      if (note.author.toString() !== req.user._id.toString()) {
        // Get current user name
        const user = await User.findById(req.user._id);
        
        await createNotification(
          note.author,
          `${user.name} liked your note "${note.title.substring(0, 30)}${note.title.length > 30 ? '...' : ''}"`
        );
      }
    }

    await note.save();
    
    res.status(200).json({ 
      success: true, 
      isLiked: !alreadyLiked,
      likesCount: note.likes.length
    });
  } catch (error) {
    console.error('Error liking note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Bookmark a note
exports.bookmarkNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if note exists
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    // Check if user already bookmarked the note
    const bookmarkIndex = user.bookmarks.findIndex(id => id.toString() === req.params.id);
    
    if (bookmarkIndex === -1) {
      // Add bookmark
      user.bookmarks.push(req.params.id);
    } else {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
    }

    await user.save();
    
    res.status(200).json({ 
      success: true, 
      data: { 
        isBookmarked: bookmarkIndex === -1,
        bookmarkIds: user.bookmarks 
      } 
    });
  } catch (error) {
    console.error('Error bookmarking note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Download a note
exports.downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    const filePath = path.join(__dirname, '..', '..', note.filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    // Increment download count
    note.downloads += 1;
    await note.save();

    // Set headers and send file
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading note:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}; 