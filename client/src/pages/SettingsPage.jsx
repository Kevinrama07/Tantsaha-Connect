import { Header } from '../components/Header';
import './SettingsPage.css';

export function SettingsPage({ onBack, onLogout }) {
  return (
    <>
      <Header title="Fikirakirana" showBack onBack={onBack} />
      <div className="settings-container page-root">
        <main className="settings-main">
          <button onClick={onLogout} className="settings-logout-button">Hiala</button>
        </main>
      </div>
    </>
    
  );
}
