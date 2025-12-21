import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function loadUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }

  async function signup(email, password, village, cultures) {
    try {
      setLoading(true);
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({ id: authData.user.id, email, village, cultures, language: 'mg' });

        if (profileError) throw profileError;
      }

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  async function updateProfile(village, cultures, language) {
    if (!session?.user) return { success: false };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ village, cultures, language })
        .eq('id', session.user.id);

      if (error) throw error;

      setUserProfile({ id: session.user.id, email: session.user.email, village, cultures, language });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { success: false, error };
    }
  }

  return {
    session,
    loading,
    userProfile,
    signup,
    login,
    logout,
    updateProfile,
  };
}
