import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookmarkedNotes, likeNote, bookmarkNote } from '../services/notesService';
import NoteList from '../components/Notes/NoteList';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async (pageNum = page) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBookmarkedNotes(pageNum, 10);
      
      if (response && response.data) {
        setNotes(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        setNotes([]);
        setTotalPages(1);
        setError('You haven\'t bookmarked any notes yet');
      }
    } catch (error) {
      console.error('Error fetching bookmarked notes:', error);
      setError('Failed to load bookmarked notes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      fetchNotes();
    }
    
    return () => {
      isMounted = false;
    };
  }, [page, fetchNotes]);

  const handleLike = async (noteId) => {
    try {
      const response = await likeNote(noteId);
      if (response.success) {
        // Update the UI immediately
        setNotes(currentNotes => 
          currentNotes.map(note => {
            if ((note._id || note.id) === noteId) {
              const isLiked = !note.isLiked;
              const likesCount = isLiked 
                ? (note.likesCount || 0) + 1 
                : (note.likesCount || 0) - 1;
              
              return { 
                ...note, 
                isLiked, 
                likesCount 
              };
            }
            return note;
          })
        );
        
        // No need to reload all bookmarks since liking doesn't affect bookmark status
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = async (noteId) => {
    try {
      const response = await bookmarkNote(noteId);
      if (response.success) {
        // Update the UI by removing the note (since it's no longer bookmarked)
        setNotes(currentNotes => 
          currentNotes.filter(note => (note._id || note.id) !== noteId)
        );
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bookmarks</h1>
          <p className="text-gray-600 dark:text-gray-300">Your bookmarked notes for quick access</p>
        </div>
      </div>
      
      {error && !isLoading && (
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      
      <NoteList 
        notes={notes} 
        isLoading={isLoading}
        isGridView={isGridView}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onViewChange={setIsGridView}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
} 