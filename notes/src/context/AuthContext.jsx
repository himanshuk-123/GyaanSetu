import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the authentication context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid by fetching user data
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Verify if the token is still valid
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        // Update user data if token is valid
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { 
          ...response.data,
          token: currentUser.token // Keep the token
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        // If token is invalid, log the user out
        logout();
      }
    } catch (error) {
      // If there's an error (like token expired), log the user out
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        // Save user to state and localStorage
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        return { success: true, user: response.data };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.success) {
        // Save user to state and localStorage
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        return { success: true, user: response.data };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Update user profile function
  const updateProfile = async (updatedData) => {
    try {
      let response;
      
      // Handle file upload separately if avatar is included
      if (updatedData.avatar && updatedData.avatar instanceof File) {
        const formData = new FormData();
        formData.append('avatar', updatedData.avatar);
        
        if (updatedData.name) formData.append('name', updatedData.name);
        if (updatedData.bio) formData.append('bio', updatedData.bio);
        
        response = await api.upload('/users/profile', formData);
      } else {
        // Regular update without file
        response = await api.put('/users/profile', updatedData);
      }
      
      if (response.success || response.data) {
        console.log('Profile update response:', response);
        // Different APIs might return data in different formats
        const responseData = response.data?.data || response.data || response;
        const updatedUser = { ...user, ...responseData };
        
        // Ensure token is preserved
        if (user && user.token) {
          updatedUser.token = user.token;
        }
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  };

  // Return the context provider with auth values
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };