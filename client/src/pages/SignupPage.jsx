import { useState } from 'react';
import { Header } from '../components/Header';
import './SignupPage.css';

export function SignupPage({ onBack, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [village, setVillage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    // Here you would call auth.signup
    if (onSuccess) onSuccess();
  }

  return (
    <>
      <Header title="Hamorona kaonty" showBack onBack={onBack} />
      <div className="signup-container page-root">
        <main className="signup-main">
          <div className="auth-card">
            <h2 className="auth-title">Hamorona kaonty</h2>
            <form onSubmit={handleSubmit} className="signup-form" aria-label="Formulaire d'inscription" role="form">
              <div className="input-group">
                <label className="signup-label" htmlFor="signup-email">Imailaka</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rakoto@example.com"
                  className="signup-input"
                  required
                  aria-required="true"
                  aria-describedby="signup-email-help"
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label className="signup-label" htmlFor="signup-password">Tenimiafina</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Farafahakeliny 8 tarehintsoratra"
                  className="signup-input"
                  required
                  aria-required="true"
                  aria-describedby="signup-password-help"
                  autoComplete="new-password"
                />
              </div>

              <div className="input-group">
                <label className="signup-label" htmlFor="signup-village">Tanàna</label>
                <input
                  id="signup-village"
                  name="village"
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Antananarivo"
                  className="signup-input"
                  aria-describedby="signup-village-help"
                  autoComplete="address-level2"
                />
              </div>

              <div id="signup-status" aria-live="polite" className="field-help" style={{minHeight: '1.2rem'}}></div>

              <button type="submit" className="signup-button">Hamorona</button>
            </form>
          </div>
        </main>
      </div>
    </>
    
  );
}
