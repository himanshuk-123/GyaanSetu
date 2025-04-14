// api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token || '';
};

const api = {
  getBaseUrl: () => API_BASE_URL,
  
  get: async (endpoint) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    
    return data;
  },
  
  post: async (endpoint, data) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'An error occurred');
    }
    
    return responseData;
  },
  
  put: async (endpoint, data) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'An error occurred');
    }
    
    return responseData;
  },
  
  delete: async (endpoint) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'An error occurred');
    }
    
    return responseData;
  },
  
  upload: async (endpoint, formData) => {
    try {
      const headers = {};
      
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};

export default api;