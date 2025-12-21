import { useState } from 'react';
import { Header } from '../components/Header';
import './LoginPage.css';

export function LoginPage({ onBack, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    // Here you would call auth.login
    if (onSuccess) onSuccess();
  }

  return (
    <>
      <Header title="Hiditra" showBack onBack={onBack} />
      <div className="login-container page-root">
        <main className="login-main">
          <div className="auth-card">
            <h2 className="auth-title">Hiditra</h2>
            <form onSubmit={handleSubmit} className="login-form" aria-label="Formulaire de connexion" role="form">
              <div className="input-group">
                <label className="login-label" htmlFor="login-email">Imailaka</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rakoto@example.com"
                  className="login-input"
                  required
                  aria-required="true"
                  aria-describedby="login-email-help"
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label className="login-label" htmlFor="login-password">Tenimiafina</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Farafahakeliny 8 tarehintsoratra"
                  className="login-input"
                  required
                  aria-required="true"
                  aria-describedby="login-password-help"
                  autoComplete="current-password"
                />
              </div>
              <div id="login-status" aria-live="polite" className="field-help" style={{minHeight: '1.2rem'}}></div>

              <button type="submit" className="login-button">Hiditra</button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
