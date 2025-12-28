import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const darkMode = saved ? saved === 'dark' : prefersDark;
    setIsDark(darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

