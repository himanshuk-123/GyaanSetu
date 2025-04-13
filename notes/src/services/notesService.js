// notesService.js
import api from './api';

// Get all notes
export const getNotes = async (page = 1, limit = 10, search = '', tags = '') => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    
    if (search) queryParams.append('search', search);
    if (tags) queryParams.append('tags', tags);
    
    console.log("Himanshu Bhai",queryParams);
    const response = await api.get(`/notes?${queryParams}`);

    console.log(response);
    return response;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { data: [], totalPages: 1 };
  }
};

// Get my notes (notes uploaded by the current user)
export const getMyNotes = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    
    const response = await api.get(`/users/notes?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching my notes:', error);
    return { data: [], totalPages: 1 };
  }
};

// Get bookmarked notes
export const getBookmarkedNotes = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    
    const response = await api.get(`/users/bookmarks?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching bookmarked notes:', error);
    return { data: [], totalPages: 1 };
  }
};

// Get note by ID
export const getNoteById = async (id) => {
  try {
    const response = await api.get(`/notes/${id}`);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload a new note
export const uploadNote = async (noteData, onProgressUpdate) => {
  try {
    const formData = new FormData();
    
    formData.append('title', noteData.title);
    formData.append('description', noteData.description);
    
    if (noteData.tags && noteData.tags.length > 0) {
      formData.append('tags', noteData.tags.join(','));
    }
    
    if (noteData.file) {
      formData.append('file', noteData.file);
    }
    
    // Create XMLHttpRequest to track upload progress if callback provided
    if (typeof onProgressUpdate === 'function') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgressUpdate(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({ success: true, data: response });
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(xhr.statusText || 'Upload failed'));
          }
        });
        
        xhr.addEventListener('error', () => reject(new Error('Network error occurred')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
        
        xhr.open('POST', `${api.getBaseUrl()}/notes`);
        
        const token = JSON.parse(localStorage.getItem('user') || '{}').token;
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });
    } else {
      // Use regular upload if no progress tracking needed
      const response = await api.upload('/notes', formData);
      return { success: true, data: response };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Like a note
export const likeNote = async (id) => {
  try {
    const response = await api.put(`/notes/${id}/like`);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error liking note:', error);
    return { success: false, error: error.message };
  }
};

// Bookmark a note
export const bookmarkNote = async (id) => {
  try {
    const response = await api.put(`/notes/${id}/bookmark`);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error bookmarking note:', error);
    return { success: false, error: error.message };
  }
};

// Add a comment to a note
export const addComment = async (noteId, content) => {
  try {
    const response = await api.post(`/notes/${noteId}/comments`, { content });
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get comments for a note
export const getComments = async (noteId, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit
    });
    
    const response = await api.get(`/notes/${noteId}/comments?${queryParams}`);
    
    // Ensure we're properly handling the response structure
    const commentsData = response.data || response || [];
    return { 
      success: true, 
      data: Array.isArray(commentsData) ? commentsData : [] 
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Download a note
export const downloadNote = async (id) => {
  try {
    // This will redirect to the download URL
    window.open(`${api.getBaseUrl()}/notes/${id}/download`, '_blank');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete a note
export const deleteNote = async (id) => {
  try {
    const response = await api.delete(`/notes/${id}`);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};