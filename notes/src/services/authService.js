import api from './api';

export const login = async (credentials) => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: '123',
          name: credentials.email.split('@')[0],
          email: credentials.email,
          avatar: `https://i.pravatar.cc/150?u=${credentials.email}`
        },
        token: 'mock-token'
      });
    }, 1000);
  });
  
  // Actual implementation would be:
  // return api.post('/auth/login', credentials);
};

export const register = async (userData) => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: '123',
          name: userData.name,
          email: userData.email,
          avatar: `https://i.pravatar.cc/150?u=${userData.email}`
        },
        token: 'mock-token'
      });
    }, 1000);
  });
  
  // Actual implementation would be:
  // return api.post('/auth/register', userData);
};

export const logout = async () => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
  
  // Actual implementation would be:
  // return api.post('/auth/logout');
};