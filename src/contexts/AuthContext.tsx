'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';


interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authInitialized: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Fetch profile — reduced to 2 retries × 300ms (max ~600ms wait)
  const fetchProfile = async (userId: string, retries = 2) => {
    console.log('[CREWZI] PROFILE FETCH START — userId:', userId);
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
            continue;
          }
          setProfile(null);
          console.log('[CREWZI] PROFILE FETCH FAILED — error:', error.message);
          return;
        }

        if (!data) {
          setProfile(null);
          console.log('[CREWZI] PROFILE FETCH FINISHED — no profile found');
          return;
        }

        setProfile(data);
        console.log('[CREWZI] PROFILE FETCH FINISHED — role:', data.role);
        return;
      } catch {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
          continue;
        }
        setProfile(null);
        console.log('[CREWZI] PROFILE FETCH FAILED — exception on final retry');
      }
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      console.log('[CREWZI] REFRESH PROFILE START');
      await fetchProfile(user.id);
      console.log('[CREWZI] REFRESH PROFILE FINISHED');
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    console.log('[CREWZI] AUTH START — registering onAuthStateChange as single source of truth');

    // Single source of truth: onAuthStateChange handles ALL auth events.
    // INITIAL_SESSION fires immediately on registration with the current session.
    // No separate getInitialSession() needed — that caused double fetchProfile.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[CREWZI] AUTH EVENT:', event);

      // TOKEN_REFRESHED: JWT silently refreshed. User identity unchanged.
      // DO NOT re-fetch profile — this was the root cause of progressive loading freezes.
      if (event === 'TOKEN_REFRESHED') {
        console.log('[CREWZI] TOKEN REFRESH — skipping profile re-fetch');
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);

      // Mark auth as initialized only after the first INITIAL_SESSION event.
      // All pages gate on authInitialized before rendering or redirecting.
      if (event === 'INITIAL_SESSION') {
        console.log('[CREWZI] AUTH FINISHED — auth initialized');
        setAuthInitialized(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };

  }, []);

  const value = {
    user,
    profile,
    loading,
    authInitialized,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
