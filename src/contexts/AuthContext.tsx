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

let listenerCount = 0;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  
  const loading = loadingState;
  const setLoading = (val: boolean) => {
    console.log(val ? 'LOADING TRUE' : 'LOADING FALSE');
    setLoadingState(val);
  };
  const [authInitialized, setAuthInitialized] = useState(false);

  // Fetch profile — reduced to 2 retries × 300ms (max ~600ms wait)
  const fetchProfile = async (userId: string, retries = 2) => {
    console.log('PROFILE FETCH START');
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
          console.log('PROFILE FETCH END');
          return;
        }

        setProfile(data);
        console.log('PROFILE FETCH END');
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
      console.log('REFRESH PROFILE START');
      await fetchProfile(user.id);
      console.log('REFRESH PROFILE END');
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
    listenerCount++;
    console.log('AUTH LISTENER CREATED. Total active:', listenerCount);

    // Single source of truth: onAuthStateChange handles ALL auth events.
    // INITIAL_SESSION fires immediately on registration with the current session.
    // No separate getInitialSession() needed — that caused double fetchProfile.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AUTH EVENT:', event);

      // TOKEN_REFRESHED: JWT silently refreshed. User identity unchanged.
      // DO NOT re-fetch profile — this was the root cause of progressive loading freezes.
      if (event === 'TOKEN_REFRESHED') {
        console.log('TOKEN REFRESH: skipping profile re-fetch');
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
        setAuthInitialized(true);
      }
    });

    return () => {
      subscription.unsubscribe();
      listenerCount--;
      console.log('AUTH LISTENER DESTROYED. Total active:', listenerCount);
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
