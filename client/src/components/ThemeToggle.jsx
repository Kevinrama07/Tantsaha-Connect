import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export function ThemeToggle({ showLabel = true }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {}

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    return 'dark';
  });

  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    const handler = (e) => {
      const t = e?.detail?.theme;
      if (t && (t === 'light' || t === 'dark')) setTheme(t);
    };

    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  function toggleTheme() {
    setAnimating(true);
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
    setTimeout(() => setAnimating(false), 480);
  }

  return (
    <button
      onClick={toggleTheme}
      className={`header-btn header-btn--theme ${theme === 'light' ? 'is-light' : 'is-dark'} ${animating ? 'is-animating' : ''}`}
      aria-label={theme === 'light' ? 'Activer le thème sombre' : 'Activer le thème clair'}
      title={theme === 'light' ? 'Sombre' : 'Clair'}
    >
      <span className="theme-icon-wrap" aria-hidden>
        <Sun className="theme-icon icon-sun" />
        <Moon className="theme-icon icon-moon" />
      </span>
    </button>
  );
}

export default ThemeToggle;