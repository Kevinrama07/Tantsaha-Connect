import { Header } from '../components/Header';
import './JournalPage.css';

export function JournalPage({ onBack }) {
  return (
    <>
      <Header title="Diary" showBack onBack={onBack} />
      <div className="journal-container">
        <main className="journal-main">
          <p>Journal et observations ici.</p>
        </main>
      </div>
    </>
    
    
  );
}