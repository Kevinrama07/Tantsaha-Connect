import { useEffect, useRef } from 'react';
import { Home, CloudSun, AlertTriangle, BookOpen, Lightbulb, Heart, Settings, LogIn, UserPlus } from 'lucide-react';
import './NavBar.css';

export function NavBar({ current, onNavigate, isAuthenticated = false }) {
  const items = [
    { key: 'home', label: "Fandraisana", Icon: Home },
    { key: 'weather', label: "Toetr'andro", Icon: CloudSun },
    { key: 'alerts', label: 'Fampitandremana', Icon: AlertTriangle },
    { key: 'journal', label: 'Diary', Icon: BookOpen },
    { key: 'advice', label: 'Torohevitra', Icon: Lightbulb },
    { key: 'favorites', label: 'Tiako', Icon: Heart },
  ];

  const navRef = useRef(null);

  useEffect(() => {
    function updateNavHeight() {
      try {
        const h = navRef.current?.offsetHeight;
        // Add a small buffer to ensure spacing
        if (h) document.documentElement.style.setProperty('--nav-height', `${h + 12}px`);
      } catch (e) {}
    }
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  return (
    <nav ref={navRef} className="app-nav">
      <div className="nav-shell">
        <div className="nav-items">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`nav-item ${current === item.key ? 'active' : ''}`}
              aria-label={item.label}
            >
              <item.Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-auth">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('login')}
                className={`nav-auth-btn ${current === 'login' ? 'active' : ''}`}
                aria-label="Connexion"
              >
                <LogIn className="nav-icon" />
              </button>

              <button
                onClick={() => onNavigate('signup')}
                className={`nav-auth-btn ${current === 'signup' ? 'active' : ''}`}
                aria-label="Inscription"
              >
                <UserPlus className="nav-icon" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('settings')}
              className={`nav-auth-btn ${current === 'settings' ? 'active' : ''}`}
              aria-label="Paramètres"
            >
              <Settings className="nav-icon" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
