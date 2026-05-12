'use client';

const DEV_MODE = false;
const DEV_ROLE: 'worker' | 'employer' = 'worker';

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

  // Fetch user profile from database
  const fetchProfile = async (userId: string, retries = 8) => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // Handle case where profile doesn't exist (not an error with maybeSingle)
        if (error) {
          if (i === retries - 1) {
            // Failed to fetch profile after retries
          } else {
            await new Promise(resolve => setTimeout(resolve, 800)); // Wait before retry
          }
          continue;
        }

        // Handle case where profile doesn't exist (data is null with maybeSingle)
        if (!data) {
          if (i === retries - 1) {
            setProfile(null); // Explicitly set to null when profile is missing
          } else {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          continue;
        }

        setProfile(data);
        return data;
      } catch (err) {
        if (i === retries - 1) {
          // Exception in fetchProfile after retries
        } else {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    }
    
    setProfile(null); // Ensure profile is null if not found
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Sign out user
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  // Initialize auth state
  useEffect(() => {
if (DEV_MODE) {

  const DEV_USER_ID = '5fd2d9e0-5213-41b2-b934-d67c0c00d2ed';

  const mockUser = {
    id: DEV_USER_ID,
    email: 'dev@shire.com',
  } as User;

  const mockProfile = {
    id: DEV_USER_ID,
    name: DEV_ROLE === 'employer'
      ? 'Dev Employer'
      : 'Dev Worker',
    role: DEV_ROLE,
  };

  setUser(mockUser);
  setProfile(mockProfile as any);
  setLoading(false);
  setAuthInitialized(true);

  return;
}
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          // No session found
        }
      } catch (err) {
        // Exception getting initial session
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

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
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}