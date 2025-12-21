import { Header } from '../components/Header';
import { useFavorites } from '../hooks/useFavorites';
import './FavoritesPage.css';

export function FavoritesPage({ onBack }) {
  const { favorites } = useFavorites();

  return (
    <>
      <Header title="Tiako" showBack onBack={onBack} />
      <div className="favorites-container page-root">

        <main className="favorites-main">
          {favorites.length === 0 ? (
            <p className="favorites-empty">Aucun favoris pour l'instant.</p>
          ) : (
            <ul className="favorites-list">
              {favorites.map((f) => (
                <li key={f.id} className="favorites-item">{f.title_mg}</li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </>
    
  );
}
