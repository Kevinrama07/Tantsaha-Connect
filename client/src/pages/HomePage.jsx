import { Header } from '../components/Header';
import { CloudSun, AlertTriangle, BookOpen, Lightbulb, Heart, Settings } from 'lucide-react';
import { Tile } from '../components/Tile';
import { useFavorites } from '../hooks/useFavorites';
import './HomePage.css';

export function HomePage({ onNavigate }) {
  const { favorites } = useFavorites();

  return (
    <>
      <Header
        title="Tantsaha Connect"
        showBack={false}
        actionIcon={Settings}
        onAction={() => onNavigate('settings')}
      />
      <div className="home-container page-root">
        <main className="home-main">
          <div className="home-grid">
            <Tile
              icon={CloudSun}
              label="Toetr'andro"
              color="blue"
              onClick={() => onNavigate('weather')}
            />

            <Tile
              icon={AlertTriangle}
              label="Fampitandremana"
              color="orange"
              onClick={() => onNavigate('alerts')}
            />

            <Tile
              icon={BookOpen}
              label="Diary"
              color="teal"
              onClick={() => onNavigate('journal')}
            />

            <Tile
              icon={Lightbulb}
              label="Torohevitra"
              color="green"
              onClick={() => onNavigate('advice')}
            />

            <Tile
              icon={Heart}
              label={`Tiako (${favorites.length})`}
              color="red"
              onClick={() => onNavigate('favorites')}
            />

            <Tile
              icon={Settings}
              label="Fikirakirana"
              color="gray"
              onClick={() => onNavigate('settings')}
            />
          </div>
        </main>
      </div>
    </>
    
  );
}
