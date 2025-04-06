// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import MyNotesPage from './pages/MyNotesPage';
import BookmarksPage from './pages/BookmarksPage';
import NoteDetail from './pages/NoteDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/Auth/PrivateRoute';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Layout routes */}
            <Route element={<Layout />}>  
              {/* Public route */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              <Route path="/users/:userId" element={<Profile />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/my-notes" element={<MyNotesPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}