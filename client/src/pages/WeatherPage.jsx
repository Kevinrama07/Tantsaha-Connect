import { Header } from '../components/Header';
import './WeatherPage.css';

export function WeatherPage({ onBack }) {
  return (
    <>
      <Header title="Toetr'andro" showBack onBack={onBack} />
      <div className="page-container page-root">
        <main className="page-main">
          <p>Contenu météo ici.</p>
        </main>
      </div>
    </>
    
  );
}
