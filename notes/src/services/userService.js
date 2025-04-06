import api from './api';

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: error.message };
  }
};

// Follow or unfollow a user
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/follow`);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error following/unfollowing user:', error);
    return { success: false, error: error.message };
  }
};

// Get user stats
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { success: false, error: error.message };
  }
}; 