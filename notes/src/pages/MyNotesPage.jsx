import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyNotes, likeNote, bookmarkNote, deleteNote } from '../services/notesService';
import NoteList from '../components/Notes/NoteList';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function MyNotesPage() {
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
      const response = await getMyNotes(pageNum, 10);
      
      if (response && response.data) {
        setNotes(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        setNotes([]);
        setTotalPages(1);
        setError('You haven\'t uploaded any notes yet');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load your notes. Please try again later.');
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
        
        // No need to reload all notes since this is just a like/unlike action
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleBookmark = async (noteId) => {
    try {
      const response = await bookmarkNote(noteId);
      if (response.success) {
        // Update the UI immediately
        setNotes(currentNotes => 
          currentNotes.map(note => {
            if ((note._id || note.id) === noteId) {
              return { 
                ...note, 
                isBookmarked: !note.isBookmarked 
              };
            }
            return note;
          })
        );
        
        // No need to reload all notes since this is just a bookmark toggle
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        const response = await deleteNote(noteId);
        if (response.success) {
          // Remove the note from the UI
          setNotes(currentNotes => 
            currentNotes.filter(note => (note._id || note.id) !== noteId)
          );
          
          // Show success message (optional)
          alert('Note deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        setError('Failed to delete note. Please try again.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Notes</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your uploaded notes</p>
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
        onDelete={handleDelete}
        onViewChange={setIsGridView}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isOwner={true}
      />
    </div>
  );
} 