import { Header } from '../components/Header';
import './AdvicePage.css';

export function AdvicePage({ onBack }) {
  return (
    <>
      <Header title="Torohevitra" showBack onBack={onBack} />

      <div className="advice-container page-root">
        <main className="advice-main">
          <p>Conseils et articles ici.</p>
        </main>
      </div>
    </>
  );
}