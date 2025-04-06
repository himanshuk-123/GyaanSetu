import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteById, likeNote, bookmarkNote, downloadNote, addComment, getComments } from '../services/notesService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { HeartIcon, BookmarkIcon, ArrowDownTrayIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import api from '../services/api';

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchNote = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getNoteById(id);
        
        if (isMounted) {
          if (response.success) {
            setNote(response.data);
            setIsLiked(response.data.isLiked || false);
            setIsBookmarked(response.data.isBookmarked || false);
            fetchComments(id);
          } else {
            setError('Note not found');
          }
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        if (isMounted) {
          setError('Failed to load note. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchNote();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchComments = async (noteId) => {
    try {
      setCommentsLoading(true);
      const response = await getComments(noteId);
      if (response.success) {
        const commentsData = response.data.data || response.data || [];
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } else {
        console.error('Failed to fetch comments:', response.error);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDownload = async () => {
    await downloadNote(id);
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await likeNote(id);
      if (response.success) {
        setIsLiked(!isLiked);
        // Update the like count in the note
        setNote(prevNote => ({
          ...prevNote,
          likesCount: isLiked 
            ? (prevNote.likesCount || 0) - 1 
            : (prevNote.likesCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await bookmarkNote(id);
      if (response.success) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      setIsCommenting(true);
      const response = await addComment(id, newComment.trim());
      if (response.success) {
        setNewComment('');
        await fetchComments(id);
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        console.error('Failed to add comment:', response.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  // Format author name based on the data structure
  const getAuthorName = () => {
    if (!note) return 'Unknown Author';
    if (typeof note.author === 'string') return note.author;
    if (note.author && note.author.name) return note.author.name;
    return 'Unknown Author';
  };

  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Note not found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The requested note could not be found
        </p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
            <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>By {getAuthorName()}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(note.createdAt || note.date)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 p-2 rounded-full ${
                isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              }`}
              title={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? (
                <HeartSolid className="w-6 h-6" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
              <span>{note.likesCount || 0}</span>
            </button>
            
            <button 
              onClick={handleBookmark}
              className={`p-2 rounded-full ${
                isBookmarked ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {isBookmarked ? (
                <BookmarkSolid className="w-6 h-6" />
              ) : (
                <BookmarkIcon className="w-6 h-6" />
              )}
            </button>
            
            <button 
              onClick={handleDownload}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full"
              title="Download"
            >
              <ArrowDownTrayIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <p className="text-gray-700 dark:text-gray-300">{note.description}</p>
        </div>
        
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {note.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* File preview or download link */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {note.fileName || note.filePath?.split('/').pop() || 'File'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {note.fileSize ? `${(note.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'} - {note.fileType || 'Unknown type'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Download
            </button>
            <button 
              onClick={() => {
                if (note.filePath) {
                  window.open(`${api.getBaseUrl()}${note.filePath}`, '_blank');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Open
            </button>
          </div>
        </div>
        
        {/* Comments */}
        <div id="comments-section" className="mt-10">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
            Comments ({comments.length})
          </h3>
          
          {/* Add comment form */}
          {user && (
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    required
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isCommenting || !newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCommenting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Comments list */}
          {commentsLoading ? (
            <div className="text-center py-6">
              <LoadingSpinner size="small" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex-shrink-0">
                    {comment.author && comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {comment.author ? comment.author.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {comment.author ? comment.author.name : 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}