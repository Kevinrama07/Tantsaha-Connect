import { ArrowLeft } from 'lucide-react';
import './Header.css';
import { ThemeToggle } from './ThemeToggle';
import { useEffect, useRef } from 'react';

export function Header({ title, showBack, onBack, actionIcon: ActionIcon, onAction }) {
  const headerRef = useRef(null);

  useEffect(() => {
    function updateHeaderHeight() {
      try {
        const h = headerRef.current?.offsetHeight;
        if (h) document.documentElement.style.setProperty('--header-height', `${h}px`);
      } catch (e) {}
    }
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <header ref={headerRef} className="app-header">
      <div className="header-inner">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="header-btn header-btn--back"
            aria-label="Retour"
          >
            <ArrowLeft className="header-icon" />
          </button>
        )}

        <h1 className="header-title">{title}</h1>

        <div className="header-actions">
          <ThemeToggle />

          {ActionIcon && onAction && (
            <button
              onClick={onAction}
              className="header-btn header-btn--action"
              aria-label="Action"
            >
              <ActionIcon className="header-icon" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
