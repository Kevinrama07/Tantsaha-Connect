import { useEffect } from 'react';
import './WelcomePage.css';
import { Header } from '../components/Header';

export function WelcomePage({ onNavigate }) {
  useEffect(() => {
    // For example, auto-navigate to home after a bit
  }, []);

  return (
    <>
      <Header title="Tongasoa" showBack={false} />
      <div className="welcome-container page-root">
        <div className="welcome-content">
          <h2>Bienvenue</h2>
          <p>Merci d'avoir rejoint Tantsaha Connect.</p>
          <div className="welcome-button-container">
            <button onClick={() => onNavigate('home')} className="welcome-button">Commencer</button>
          </div>
        </div>
      </div>
    </>
    
  );
}
