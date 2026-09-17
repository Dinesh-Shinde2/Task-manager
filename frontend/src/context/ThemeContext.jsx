import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Minimalist Light Theme (Black, White, Silver, Off-White)

  useEffect(() => {
    localStorage.setItem('app_theme', 'light');
    document.documentElement.classList.remove('dark', 'theme-midnight', 'theme-dark-navy');
    document.documentElement.classList.add('theme-light');
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
