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

  // Fetch user profile from database
  const fetchProfile = async (userId: string, retries = 3) => {
    console.log('🔍 Fetching profile for user:', userId);
    
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error(`❌ Error fetching profile (attempt ${i + 1}):`, error);
          if (i === retries - 1) {
            // Don't set profile to null on last retry, keep existing state
            console.log('⚠️ Failed to fetch profile after retries, keeping existing state');
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          continue;
        }

        console.log('✅ Profile fetched successfully:', data);
        setProfile(data);
        return data;
      } catch (err) {
        console.error(`❌ Exception in fetchProfile (attempt ${i + 1}):`, err);
        if (i === retries - 1) {
          console.log('⚠️ Exception in fetchProfile after retries');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for user:', user.id);
      await fetchProfile(user.id);
    }
  };

  // Sign out user
  const signOut = async () => {
    console.log('🚪 Signing out user');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  // Initialize auth state
  useEffect(() => {
    if (authInitialized) return;
    
    console.log('🚀 Initializing auth state...');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Session found for user:', session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('ℹ️ No session found');
        }
      } catch (err) {
        console.error('❌ Exception getting initial session:', err);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
        console.log('🏁 Auth initialization complete');
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', { event, hasUser: !!session?.user });
        
        if (session?.user) {
          console.log('✅ User signed in:', session.user.id);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('ℹ️ User signed out');
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [authInitialized]);

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
