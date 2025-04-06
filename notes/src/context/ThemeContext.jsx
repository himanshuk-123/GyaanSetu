import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check if user prefers dark mode from system settings
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check for saved theme preference or use system preference as fallback
    const savedDarkMode = localStorage.getItem('darkMode');
    const initialDarkMode = savedDarkMode !== null 
      ? savedDarkMode === 'true' 
      : prefersDarkMode;
    
    setDarkMode(initialDarkMode);
    
    // Apply dark mode to document
    applyDarkMode(initialDarkMode);
    
    // Add listener for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaQueryChange = (e) => {
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
        applyDarkMode(e.matches);
      }
    };
    
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleMediaQueryChange);
    } else {
      // Fallback for older browsers
      darkModeMediaQuery.addListener(handleMediaQueryChange);
    }
    
    return () => {
      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', handleMediaQueryChange);
      } else {
        darkModeMediaQuery.removeListener(handleMediaQueryChange);
      }
    };
  }, []);

  const applyDarkMode = (isDark) => {
    // Apply dark mode toggle to both document element and body
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    
    // Apply dark mode to main HTML elements
    // Apply styles directly to ensure they take effect
    if (isDark) {
      document.documentElement.style.backgroundColor = '#1a202c';
      document.body.style.backgroundColor = '#1a202c';
      document.body.style.color = '#f7fafc';
    } else {
      document.documentElement.style.backgroundColor = '#ffffff';
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#1a202c';
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    applyDarkMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);