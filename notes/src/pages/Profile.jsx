import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserProfile, followUser } from '../services/userService';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function Profile() {
  const { userId } = useParams();
  const { user, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [profileData, setProfileData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: null
  });
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // If userId is provided, we're viewing someone else's profile
        if (userId && userId !== user?._id) {
          setIsOwnProfile(false);
          const response = await getUserProfile(userId);
          if (response.success) {
            setProfileData(response.data.user);
            setIsFollowing(response.data.user.isFollowing);
          } else {
            setErrorMessage('Failed to load profile');
          }
        } else {
          // Own profile - use logged in user data
          setIsOwnProfile(true);
          // If we're viewing our own profile, fetch the latest stats
          const response = await getUserProfile(user?._id);
          if (response.success) {
            // Merge the user data from auth context with the stats from the profile API
            setProfileData({
              ...user,
              notesCount: response.data.user.notesCount || 0,
              followersCount: response.data.user.followersCount || 0,
              followingCount: response.data.user.followingCount || 0
            });
          } else {
            setProfileData(user);
          }
          
          setFormData({
            name: user?.name || '',
            bio: user?.bio || '',
            avatar: null
          });
          setAvatarPreview(user?.avatar);
        }
      } catch (error) {
        setErrorMessage('Failed to load profile');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProfile();
    }
  }, [userId, user]);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'avatar' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Send data to backend via updateProfile
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFollowToggle = async () => {
    if (!userId) return;
    
    try {
      setIsProcessingFollow(true);
      const response = await followUser(userId);
      
      if (response.success) {
        setIsFollowing(response.data.isFollowing);
        // Update followers count in the profile data
        setProfileData(prev => ({
          ...prev,
          followersCount: response.data.isFollowing 
            ? (prev.followersCount || 0) + 1 
            : (prev.followersCount || 0) - 1
        }));
      } else {
        setErrorMessage(response.error || 'Failed to update follow status');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update follow status');
    } finally {
      setIsProcessingFollow(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        {isOwnProfile ? 'Your Profile' : `${profileData?.name}'s Profile`}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="relative bg-blue-600 dark:bg-blue-800 h-40">
          <div className="absolute -bottom-16 left-8">
            {(isOwnProfile ? avatarPreview : profileData?.avatar) ? (
              <img 
                src={isOwnProfile ? avatarPreview : profileData?.avatar} 
                alt={isOwnProfile ? user?.name : profileData?.name} 
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <UserCircleIcon className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="pt-20 px-8 pb-8">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          {isOwnProfile && isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Profile Picture
                </label>
                <input
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  accept="image/*"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                ></textarea>
              </div>
              
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{isOwnProfile ? user?.name : profileData?.name}</h2>
                  {isOwnProfile && <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email || ''}</p>}
                  
                  <div className="flex gap-4 mt-3 mb-4">
                    <div className="text-center">
                      <span className="block font-bold text-lg">{isOwnProfile ? user?.notesCount || 0 : profileData?.notesCount || 0}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Notes</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-lg">{isOwnProfile ? user?.followersCount || 0 : profileData?.followersCount || 0}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Followers</span>
                    </div>
                    <div className="text-center">
                      <span className="block font-bold text-lg">{isOwnProfile ? user?.followingCount || 0 : profileData?.followingCount || 0}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Following</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300">
                    {isOwnProfile ? user?.bio || 'No bio available' : profileData?.bio || 'No bio available'}
                  </p>
                </div>
                
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    disabled={isProcessingFollow}
                    className={`px-4 py-2 rounded-lg ${
                      isFollowing 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isProcessingFollow 
                      ? 'Processing...' 
                      : isFollowing 
                        ? 'Unfollow' 
                        : 'Follow'}
                  </button>
                )}
              </div>
            </>
          )}
          
          {isOwnProfile && (
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Appearance</h4>
                  <div className="flex items-center">
                    <span className="mr-2">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    <button
                      onClick={toggleDarkMode}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-gray-200 dark:bg-gray-700"
                    >
                      <span
                        className={`${
                          darkMode ? 'translate-x-6 bg-blue-500' : 'translate-x-1 bg-white'
                        } inline-block h-4 w-4 transform rounded-full transition-transform`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}