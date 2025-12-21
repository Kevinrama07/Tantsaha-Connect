import { Sprout, CloudSun, AlertTriangle, BookOpen, Volume2 } from 'lucide-react';
import './LandingPage.css';
import { ThemeToggle } from '../components/ThemeToggle';

export function LandingPage({ onNavigate }) {
  return (
    <div className="landing-container page-root">
      <div className="landing-hero" aria-hidden="true"></div>
      <div className="landing-header">
        <div className="landing-header-top">
          <div className="landing-header-content">
            <Sprout />
            <h1>Tantsaha Connect</h1>
            <div className="landing-header-actions">
              <ThemeToggle />
            </div>
          </div>

          
        </div>

        <p className="landing-subtitle">Fanampiana ho an'ny tantsaha malagasy</p>
      </div>

      <div className="landing-content">
        <div className="landing-features">
          <div className="landing-feature">
            <CloudSun className="landing-feature-icon weather" />
            <div>
              <h3>Toetr'andro</h3>
              <p>Faminavinana ny toetr'andro araka ny toerana misy anao</p>
            </div>
          </div>

          <div className="landing-feature">
            <AlertTriangle className="landing-feature-icon alert" />
            <div>
              <h3>Fampitandremana</h3>
              <p>Fampitandremana ara-pambolena ho an'ny voly ataonao</p>
            </div>
          </div>

          <div className="landing-feature">
            <BookOpen className="landing-feature-icon journal" />
            <div>
              <h3>Diary</h3>
              <p>Diary mirakitra ny momba ny fambolena</p>
            </div>
          </div>

          <div className="landing-feature">
            <Volume2 className="landing-feature-icon advice" />
            <div>
              <h3>Torohevitra</h3>
              <p>Torohevitra am-peo sy fanampiana anao amin'ny voly</p>
            </div>
          </div>
        </div>

        <div className="landing-buttons">
          <button
            onClick={() => onNavigate('signup')}
            className="landing-btn landing-btn-signup"
          >
            Hamorona kaonty
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="landing-btn landing-btn-login"
          >
            Hiditra
          </button>
        </div>

        <div className="landing-footer">
          <p>Maimaimpoana • Haingana • Tsy misy dokambarotra</p>
        </div>
      </div>
    </div>
  );
}
