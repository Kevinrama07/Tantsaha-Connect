import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'tantsaha_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  function loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur lors de la lecture des favoris:', error);
    } finally {
      setLoading(false);
    }
  }

  function saveFavorites(updated) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      setFavorites(updated);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  }

  function addFavorite(favorite) {
    const exists = favorites.some(
      (f) => f.item_id === favorite.item_id && f.item_type === favorite.item_type
    );

    if (!exists) {
      const updated = [...favorites, favorite];
      saveFavorites(updated);
    }
  }

  function removeFavorite(itemId, itemType) {
    const updated = favorites.filter(
      (f) => !(f.item_id === itemId && f.item_type === itemType)
    );
    saveFavorites(updated);
  }

  function toggleFavorite(itemId, itemType, title_mg, content_mg) {
    const isFavorited = isFavorite(itemId, itemType);

    if (isFavorited) {
      removeFavorite(itemId, itemType);
    } else {
      addFavorite({
        id: `${itemType}-${itemId}-${Date.now()}`,
        item_id: itemId,
        item_type: itemType,
        title_mg,
        content_mg,
        created_at: new Date().toISOString(),
      });
    }
  }

  function isFavorite(itemId, itemType) {
    return favorites.some((f) => f.item_id === itemId && f.item_type === itemType);
  }

  function getFavoritesOfType(itemType) {
    return favorites.filter((f) => f.item_type === itemType);
  }

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesOfType,
  };
}
