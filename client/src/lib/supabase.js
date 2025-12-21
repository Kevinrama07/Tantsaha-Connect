// Lightweight backend wrapper that replaces Supabase client with REST calls to our MySQL-backed API
// Exports a `supabase` object with a compatible subset of methods used by the frontend

const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'tantsaha:token';

export const isSupabaseConfigured = false; // not using Supabase anymore; keep export for compatibility

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

const subscribers = new Set();
function notifyAuth(event, session) {
  subscribers.forEach(cb => {
    try { cb(event, session); } catch (e) { console.error('auth subscriber error', e); }
  });
}

async function fetchJson(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, { ...options, headers });
  const text = await res.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch (e) { body = { raw: text }; }
  if (!res.ok) return { data: null, error: body.error || body };
  return { data: body, error: null };
}

export const supabase = {
  auth: {
    getSession: async () => {
      const token = getToken();
      if (!token) return { data: { session: null } };
      const payload = parseJwt(token);
      const session = { access_token: token, user: { id: payload?.userId, email: payload?.email } };
      return { data: { session } };
    },
    onAuthStateChange: (cb) => {
      subscribers.add(cb);
      return { data: { subscription: { unsubscribe: () => subscribers.delete(cb) } } };
    },
    signUp: async ({ email, password }) => {
      const { data, error } = await fetchJson('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (error) return { data: null, error };
      const token = data.token;
      setToken(token);
      const payload = parseJwt(token);
      const session = { access_token: token, user: { id: payload?.userId, email: payload?.email } };
      notifyAuth('SIGNED_IN', session);
      return { data: { user: session.user }, error: null };
    },
    signInWithPassword: async ({ email, password }) => {
      const { data, error } = await fetchJson('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (error) return { data: null, error };
      const token = data.token;
      setToken(token);
      const payload = parseJwt(token);
      const session = { access_token: token, user: { id: payload?.userId, email: payload?.email } };
      notifyAuth('SIGNED_IN', session);
      return { data: { user: session.user }, error: null };
    },
    signOut: async () => {
      clearToken();
      notifyAuth('SIGNED_OUT', null);
      return { data: null, error: null };
    }
  },

  // Minimal `from` implementation to cover the queries used in the app
  from: (table) => {
    const t = table;
    return {
      select: (_sel) => ({
        eq: (field, value) => ({
          single: async () => {
            try {
              if (t === 'user_profiles') {
                // we always return the profile for the authenticated user
                const { data, error } = await fetchJson('/api/profile', { method: 'GET' });
                if (error) return { data: null, error };
                return { data: data.data || null, error: null };
              }

              if (t === 'favorites') {
                const { data, error } = await fetchJson('/api/favorites', { method: 'GET' });
                if (error) return { data: null, error };
                // if eq was used, try to find by id
                const found = (data.data || []).find(x => String(x[field]) === String(value));
                return { data: found || null, error: null };
              }

              // fallback: return first match from GET list
              return { data: null, error: new Error('Not implemented') };
            } catch (e) {
              return { data: null, error: e };
            }
          }
        })
      }),

      insert: async (obj) => {
        try {
          if (t === 'user_profiles') {
            const { data, error } = await fetchJson('/api/profile', { method: 'POST', body: JSON.stringify(obj) });
            if (error) return { data: null, error };
            return { data: data, error: null };
          }

          if (t === 'favorites') {
            const { data, error } = await fetchJson('/api/favorites', { method: 'POST', body: JSON.stringify(obj) });
            if (error) return { data: null, error };
            return { data: data, error: null };
          }

          if (t === 'journal_entries' || t === 'journal') {
            const { data, error } = await fetchJson('/api/journal', { method: 'POST', body: JSON.stringify(obj) });
            if (error) return { data: null, error };
            return { data: data, error: null };
          }

          return { data: null, error: new Error('Insert not implemented for table: ' + t) };
        } catch (e) {
          return { data: null, error: e };
        }
      },

      update: (obj) => ({
        eq: async (field, value) => {
          try {
            if (t === 'journal_entries' || t === 'journal') {
              const id = value;
              const { data, error } = await fetchJson(`/api/journal/${id}`, { method: 'PUT', body: JSON.stringify(obj) });
              if (error) return { data: null, error };
              return { data, error: null };
            }

            if (t === 'advice_entries') {
              const id = value;
              const { data, error } = await fetchJson(`/api/advice/${id}`, { method: 'PUT', body: JSON.stringify(obj) });
              if (error) return { data: null, error };
              return { data, error: null };
            }

            return { data: null, error: new Error('Update not implemented for table: ' + t) };
          } catch (e) {
            return { data: null, error: e };
          }
        }
      }),

      delete: () => ({
        eq: async (field, value) => {
          try {
            if (t === 'favorites') {
              const id = value;
              const { data, error } = await fetchJson(`/api/favorites/${id}`, { method: 'DELETE' });
              if (error) return { data: null, error };
              return { data: null, error: null };
            }

            if (t === 'journal_entries' || t === 'journal') {
              const id = value;
              const { data, error } = await fetchJson(`/api/journal/${id}`, { method: 'DELETE' });
              if (error) return { data: null, error };
              return { data: null, error: null };
            }

            return { data: null, error: new Error('Delete not implemented for table: ' + t) };
          } catch (e) {
            return { data: null, error: e };
          }
        }
      })
    };
  }
};