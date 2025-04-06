// NoteCard.jsx
import { HeartIcon, BookmarkIcon, ArrowDownTrayIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { downloadNote } from '../../services/notesService';
import "./NoteCard.css";

export default function NoteCard({ note, isGridView, onLike, onBookmark, onDelete, isOwner = false, isProcessingLike, isProcessingBookmark }) {
  // Initialize state from note props
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  
  // Update state when note props change
  useEffect(() => {
    setIsLiked(note.isLiked || false);
    setIsBookmarked(note.isBookmarked || false);
    
    // Handle data structure from backend which might have likes array or likesCount
    setLikeCount(
      note.likesCount || (note.likes && Array.isArray(note.likes) ? note.likes.length : 0)
    );
    
    // Handle comment count
    setCommentCount(
      note.commentsCount || (note.comments && Array.isArray(note.comments) ? note.comments.length : 0)
    );
  }, [note]);
  
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);
    // Update UI optimistically
    setLikeCount(prev => newLikeStatus ? prev + 1 : Math.max(0, prev - 1));
    // Send API request to update on server
    onLike?.(note._id || note.id);
  };
  
  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newBookmarkStatus = !isBookmarked;
    setIsBookmarked(newBookmarkStatus);
    // Send API request to update on server
    onBookmark?.(note._id || note.id);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await downloadNote(note._id || note.id);
  };
  
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(note._id || note.id);
  };

  // Format author name based on the data structure
  const getAuthorName = () => {
    if (typeof note.author === 'string') return note.author;
    if (note.author && note.author.name) return note.author.name;
    return 'Unknown Author';
  };

  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get file type icon or thumbnail
  const getFileTypeDisplay = () => {
    const fileType = note.fileType || 
                   (note.file && note.file.split('.').pop().toLowerCase()) || 
                   'unknown';
                   
    // You would expand this with more file type icons
    return (
      <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">
        {fileType.toUpperCase()}
      </div>
    );
  };

  return (
    <div className={`group transition-all duration-200 hover:shadow-lg ${
      isGridView 
        ? 'rounded-xl bg-white dark:bg-gray-700 p-5 shadow-md hover:-translate-y-1 flex flex-col h-full'
        : 'rounded-lg bg-white dark:bg-gray-700 p-4 shadow-sm mb-4 flex flex-col md:flex-row md:items-center gap-4'
    }`}>
      {/* Content */}
      <div className={`flex-1 ${isGridView ? 'flex flex-col h-full' : ''}`}>
        <div className="flex justify-between mb-2">
          <Link to={`/notes/${note._id || note.id}`} className="block">
            <h3 className={`font-medium ${isGridView ? 'text-lg line-clamp-2' : 'text-md md:text-lg'}`}>
              {note.title}
            </h3>
          </Link>
          
          {isOwner && onDelete && (
            <button 
              onClick={handleDelete}
              className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Delete note"
              aria-label="Delete note"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <Link to={`/notes/${note._id || note.id}`} className="block">
          <p className={`text-gray-600 dark:text-gray-300 ${
            isGridView ? 'text-sm line-clamp-2 mb-3' : 'text-xs md:text-sm line-clamp-1'
          }`}>
            {note.description}
          </p>
        </Link>

        {/* Tags if available */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 my-2">
            {note.tags.slice(0, isGridView ? 3 : 5).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > (isGridView ? 3 : 5) && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">
                +{note.tags.length - (isGridView ? 3 : 5)}
              </span>
            )}
          </div>
        )}

        {/* File type */}
        <div className="mt-2 mb-3">
          {getFileTypeDisplay()}
        </div>

        {/* Footer */}
        <div className={`mt-auto flex items-center justify-between ${
          isGridView ? '' : 'md:mt-2'
        }`}>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="truncate">By {getAuthorName()}</p>
            <p>{formatDate(note.createdAt || note.date)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleLike}
              disabled={isProcessingLike?.[note._id]}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked 
                  ? 'like-active' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              }`}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? (
                <HeartSolid className="w-4 h-4 like-icon" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{likeCount}</span>
            </button>

            <button 
              onClick={handleBookmark}
              disabled={isProcessingBookmark?.[note._id]}
              className={`transition-colors ${
                isBookmarked 
                  ? 'bookmark-active' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
              }`}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {isBookmarked ? (
                <BookmarkSolid className="w-4 h-4 bookmark-icon" />
              ) : (
                <BookmarkIcon className="w-4 h-4" />
              )}
            </button>
            
            {/* Comment count */}
            <Link 
              to={`/notes/${note._id || note.id}`}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>{commentCount}</span>
            </Link>

            <button 
              onClick={handleDownload}
              className={`p-2 rounded-full ${
                isGridView 
                  ? 'bg-gray-100 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-500'
                  : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
              }`}
              aria-label="Download"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}