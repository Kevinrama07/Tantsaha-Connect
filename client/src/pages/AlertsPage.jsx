import { Header } from '../components/Header';
import './AlertsPage.css';

export function AlertsPage({ onBack }) {
  return (
    <>
      <Header title="Fampitandremana" showBack onBack={onBack} />
      
      <div className="alerts-container page-root">
        <main className="alerts-main">
          <p>Liste des alertes ici.</p>
        </main>
      </div>
    </>
  );
}
