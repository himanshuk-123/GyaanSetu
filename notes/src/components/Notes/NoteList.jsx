import { useState } from 'react';
import NoteCard from './NoteCard';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function NoteList({ 
  notes,
  isLoading, 
  isGridView = true, 
  onLike, 
  onBookmark,
  onDelete,
  onViewChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isOwner = false
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No notes found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isOwner 
            ? "You haven't uploaded any notes yet. Start by uploading your first note!"
            : "Try adjusting your search or upload a new note"
          }
        </p>
      </div>
    );
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => onViewChange(true)}
            className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
              isGridView 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onViewChange(false)}
            className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
              !isGridView 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            List
          </button>
        </div>
      </div>
      
      <div className={isGridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {notes.map(note => (
          <NoteCard
            key={note._id || note.id}
            note={note}
            isGridView={isGridView}
            onLike={onLike}
            onBookmark={onBookmark}
            onDelete={isOwner && onDelete ? onDelete : undefined}
            isOwner={isOwner}
          />
        ))}
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}