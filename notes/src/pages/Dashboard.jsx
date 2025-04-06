import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, likeNote, bookmarkNote } from '../services/notesService';
import NoteList from '../components/Notes/NoteList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiSearch, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiHeart, FiBookmark, FiFilter, FiX } from 'react-icons/fi';
import TagInput from '../components/Common/TagInput';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isProcessingLike, setIsProcessingLike] = useState({});
  const [isProcessingBookmark, setIsProcessingBookmark] = useState({});
  
  const fetchNotes = useCallback(async (currentPage = page, search = searchTerm, tags = selectedTags) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getNotes(currentPage, 10, search, tags.join(','));
      
      if (response && response.data) {
        setNotes(response.data);
        setFilteredNotes(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        setNotes([]);
        setFilteredNotes([]);
        setTotalPages(1);
        setError('No notes found');
      }
      } catch (error) {
        console.error('Error fetching notes:', error);
      setError('Failed to load notes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
  }, [page, searchTerm, selectedTags]);
    
  useEffect(() => {
    fetchNotes();
  }, [page, selectedTags, fetchNotes]);

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        setFilteredNotes(notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchTerm, notes]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      fetchNotes(1, value, selectedTags);
    }, 300);
    
    setSearchTimeout(newTimeout);
    
    setPage(1);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleLike = async (noteId) => {
    if (!user) return;
    setIsProcessingLike(prev => ({ ...prev, [noteId]: true }));
    try {
      const response = await likeNote(noteId);
      if (response.success) {
      setNotes(prevNotes => 
        prevNotes.map(note => 
            note._id === noteId 
              ? { 
                  ...note, 
                  likesCount: note.isLiked ? note.likesCount - 1 : note.likesCount + 1, 
                  isLiked: !note.isLiked 
                }
              : note
          )
        );
        setFilteredNotes(prevNotes => 
          prevNotes.map(note => 
            note._id === noteId 
              ? { 
                  ...note, 
                  likesCount: note.isLiked ? note.likesCount - 1 : note.likesCount + 1, 
                  isLiked: !note.isLiked 
                }
            : note
        )
      );
      }
    } catch (error) {
      console.error('Error liking note:', error);
    } finally {
      setIsProcessingLike(prev => ({ ...prev, [noteId]: false }));
    }
  };

  const handleBookmark = async (noteId) => {
    if (!user) return;
    setIsProcessingBookmark(prev => ({ ...prev, [noteId]: true }));
    try {
      const response = await bookmarkNote(noteId);
      if (response.success) {
      setNotes(prevNotes => 
        prevNotes.map(note => 
            note._id === noteId 
              ? { ...note, isBookmarked: !note.isBookmarked }
              : note
          )
        );
        setFilteredNotes(prevNotes => 
          prevNotes.map(note => 
            note._id === noteId 
              ? { ...note, isBookmarked: !note.isBookmarked }
            : note
        )
      );
      }
    } catch (error) {
      console.error('Error bookmarking note:', error);
    } finally {
      setIsProcessingBookmark(prev => ({ ...prev, [noteId]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setPage(1);
  };

  const toggleViewMode = () => {
    setIsGridView(!isGridView);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            {user ? `Welcome back, ${user.name || 'User'}` : 'Welcome to NotesShare'}
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300">Browse and discover notes from the community</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsGridView(true)}
            className={`p-2 rounded-lg ${isGridView ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            aria-label="Grid view"
          >
            <FiGrid size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsGridView(false)}
            className={`p-2 rounded-lg ${!isGridView ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            aria-label="List view"
          >
            <FiList size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1"
            aria-label="Filters"
          >
            <FiFilter size={20} />
            <span className="hidden sm:inline">Filters</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800 dark:text-white">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
                onChange={handleSearchChange}
              />
              <button 
                type="submit"
                className="absolute left-3 top-2.5 text-gray-400"
              >
                <FiSearch size={20} />
              </button>
            </form>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
              <TagInput 
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
        </div>
            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Clear All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white"
              >
                Apply Filters
              </motion.button>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300 flex justify-between items-center"
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100">
            <FiX size={20} />
          </button>
        </motion.div>
      )}
      
      <NoteList 
        notes={filteredNotes} 
        isLoading={isLoading}
        isGridView={isGridView}
        onLike={handleLike}
        onBookmark={handleBookmark}
        isProcessingLike={isProcessingLike}
        isProcessingBookmark={isProcessingBookmark}
        onViewChange={setIsGridView}
      />
      
      {!isLoading && filteredNotes.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`p-2 rounded-full ${page === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'}`}
            aria-label="Previous page"
          >
            <FiChevronLeft size={24} />
          </motion.button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {pageNum}
                </motion.button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <span className="mx-1 text-gray-500">...</span>
            )}
            {totalPages > 5 && page < totalPages - 2 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(totalPages)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${page === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {totalPages}
              </motion.button>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`p-2 rounded-full ${page === totalPages ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'}`}
            aria-label="Next page"
          >
            <FiChevronRight size={24} />
          </motion.button>
        </div>
      )}
    </div>
  );
}