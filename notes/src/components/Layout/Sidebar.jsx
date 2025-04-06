// Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
// import ThemeColorPicker from '../ThemeColorPicker';
import { 
  HomeIcon, 
  FolderIcon, 
  BookmarkIcon, 
  UserIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ isMobileMenuOpen, closeMobileMenu }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  // Common navigation links for all users
  const publicNavLinks = [
    { to: '/', icon: <HomeIcon className="w-5 h-5" />, label: 'Dashboard' }
  ];
  
  // Navigation links for authenticated users
  const authNavLinks = [
    { to: '/upload', icon: <ArrowUpTrayIcon className="w-5 h-5" />, label: 'Upload Note' },
    { to: '/my-notes', icon: <FolderIcon className="w-5 h-5" />, label: 'My Notes' },
    { to: '/bookmarks', icon: <BookmarkIcon className="w-5 h-5" />, label: 'Bookmarks' },
    { to: '/profile', icon: <UserIcon className="w-5 h-5" />, label: 'Profile' }
  ];
  
  // Auth navigation links for guests
  const guestNavLinks = [
    { to: '/login', icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />, label: 'Login' },
    { to: '/register', icon: <UserPlusIcon className="w-5 h-5" />, label: 'Register' }
  ];
  
  // Get the appropriate navigation links based on auth status
  const navLinks = [...publicNavLinks, ...(user ? authNavLinks : guestNavLinks)];

  return (
    <>
      {/* Overlay for mobile menu (visible only on mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 md:z-30 w-64 h-screen pt-16 pb-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Close Button */}
        <button 
          className="absolute top-4 right-4 md:hidden text-gray-500 dark:text-gray-400"
          onClick={closeMobileMenu}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Sidebar Content */}
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo (Mobile Only) */}
          <div className="md:hidden px-4 pt-2 pb-6">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              NotesShare
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => 
                  `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
                onClick={closeMobileMenu}
              >
                <span className="mr-3">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Theme Controls (Mobile Only) */}
          <div className="md:hidden px-4 py-4 mt-auto space-y-4">
            {/* <ThemeColorPicker className="justify-start mb-4" /> */}
            
            <div className="flex items-center px-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
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
      </aside>
    </>
  );
}
