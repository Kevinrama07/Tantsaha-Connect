import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import './FavoriteButton.css';

export function FavoriteButton({ itemId, itemType, title_mg, content_mg, size = 'md' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(itemId, itemType);

  const sizeClass = size === 'sm' ? 'fav-icon-sm' : 'fav-icon-md';
  const paddingClass = size === 'sm' ? 'fav-sm' : 'fav-md';

  return (
    <button
      onClick={() => toggleFavorite(itemId, itemType, title_mg, content_mg)}
      className={`fav-btn ${favorited ? 'fav-btn--active' : 'fav-btn--inactive'} ${paddingClass}`}
      aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart className={`${sizeClass} ${favorited ? 'fav-fill' : ''}`} />
    </button>
  );
}
