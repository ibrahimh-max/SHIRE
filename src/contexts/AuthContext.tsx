'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';

const DEV_MODE = false;

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

  // Fetch profile
  const fetchProfile = async (userId: string, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 800));
            continue;
          }

          setProfile(null);
          return;
        }

        if (!data) {
          setProfile(null);
          return;
        }

        setProfile(data);
        return;
      } catch {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
          continue;
        }

        setProfile(null);
      }
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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

    // DEV MODE
    if (DEV_MODE) {

      const DEV_USER_ID = '5fd2d9e0-5213-41b2-b934-d67c0c00d2ed';

      const mockUser = {
        id: DEV_USER_ID,
        email: 'dev@shire.com',
      } as User;

      const mockProfile = {
        id: DEV_USER_ID,
        name: 'Dev User',
        role: 'employer',
      };

      setUser(mockUser);
      setProfile(mockProfile as Profile);
      setLoading(false);
      setAuthInitialized(true);

      return;
    }

    // REAL AUTH FLOW
    const getInitialSession = async () => {
      try {

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setLoading(false);
          setAuthInitialized(true);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

      } catch {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    getInitialSession();

    // AUTH LISTENER
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
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