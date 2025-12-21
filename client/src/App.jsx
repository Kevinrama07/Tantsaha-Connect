import { useEffect, useState } from 'react';
import './App.css';
import React from 'react';
import { isSupabaseConfigured } from './lib/supabase';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('Uncaught error in component tree:', error, info);
  }

  render() {
    if (this.state.error) {
      // Suppress on-page error display; error details are logged to console in componentDidCatch
      return null;
    }

    return this.props.children;
  }
}


import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { WeatherPage } from './pages/WeatherPage';
import { AlertsPage } from './pages/AlertsPage';
import { JournalPage } from './pages/JournalPage';
import { AdvicePage } from './pages/AdvicePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SettingsPage } from './pages/SettingsPage';
import { WelcomePage } from './pages/WelcomePage';

import { useAuth } from './hooks/useAuth';

export default function App() {
  const { session, loading } = useAuth();
  const [page, setPage] = useState('landing');
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    // Choisir la page d'accueil selon la session
    if (!loading) {
      setPage(session ? 'home' : 'landing');
    }
  }, [session, loading]);

  // Retrigger entry animations when page changes
  useEffect(() => {
    setMounted(false);
    const id = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(id);
  }, [page]);

  // Global error listeners to capture runtime errors
  useEffect(() => {
    function onError(event) {
      console.error('Global error caught', event);
    }
    function onRejection(event) {
      console.error('Unhandled promise rejection', event);
    }
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  function navigate(to) {
    window.scrollTo(0, 0);
    setPage(to);
  }

  function goBack() {
    setPage(session ? 'home' : 'landing');
  }

  let content = null;

  switch (page) {
    case 'landing':
      content = <LandingPage onNavigate={navigate} />;
      break;
    case 'home':
      content = <HomePage onNavigate={navigate} />;
      break;
    case 'weather':
      content = <WeatherPage onBack={goBack} />;
      break;
    case 'alerts':
      content = <AlertsPage onBack={goBack} />;
      break;
    case 'journal':
      content = <JournalPage onBack={goBack} />;
      break;
    case 'advice':
      content = <AdvicePage onBack={goBack} />;
      break;
    case 'favorites':
      content = <FavoritesPage onBack={goBack} />;
      break;
    case 'login':
      content = <LoginPage onBack={goBack} onSuccess={() => navigate('home')} />;
      break;
    case 'signup':
      content = <SignupPage onBack={goBack} onSuccess={() => navigate('home')} />;
      break;
    case 'settings':
      content = <SettingsPage onBack={goBack} />;
      break;
    case 'welcome':
      content = <WelcomePage onNavigate={navigate} />;
      break;
    default:
      content = <LandingPage onNavigate={navigate} />;
  }

  return (
    <ErrorBoundary>
      <div className={`app-root ${mounted ? 'is-mounted' : ''}`}>


        <div className="app-content">{content}</div>

        {/* Montrer la barre de navigation sauf sur la page d'atterrissage */}
        {page !== 'landing' && (
          <NavBar current={page} onNavigate={navigate} isAuthenticated={!!session} />
        )}


      </div>
    </ErrorBoundary>
  );
}
