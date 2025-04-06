const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downloads: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for like count
noteSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Add virtual for comments
noteSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'note'
});

// Add virtual for comment count
noteSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'note',
  count: true
});

// Add index for better search performance
noteSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note; 