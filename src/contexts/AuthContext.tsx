'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const [authInitialized, setAuthInitialized] = useState(false);

  // CRITICAL: Memory ref to track the current logged-in user ID.
  // This acts as our source of truth to block redundant Supabase event cycles.
  const lastProcessedUserId = useRef<string | null>(null);

  const loading = loadingState;
  const setLoading = (val: boolean) => {
    console.log(val ? 'LOADING TRUE' : 'LOADING FALSE');
    setLoadingState(val);
  };

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
    lastProcessedUserId.current = null;
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    listenerCount++;
    console.log('AUTH LISTENER CREATED. Total active:', listenerCount);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AUTH EVENT:', event);

      const currentUid = session?.user?.id || null;

      // 1. DEDUPLICATION GUARD: If the user ID matches what we are already running, 
      // do absolutely nothing. This eliminates the loop inside Capacitor WebViews.
      if (
        currentUid === lastProcessedUserId.current && 
        (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN')
      ) {
        console.log(`[CREWZI] Redundant ${event} for active user ${currentUid}. Aborting loop.`);
        
        // Fail-safe layout sync
        setAuthInitialized(true);
        setLoading(false);
        return;
      }

      // 2. HANDLE SIGN_OUT / NULL SESSION: Clear states reliably
      if (!session?.user) {
        console.log('[CREWZI] No active session found. Cleaning state.');
        lastProcessedUserId.current = null;
        setUser(null);
        setProfile(null);
        setLoading(false);
        setAuthInitialized(true); 
        return;
      }

      // 3. HANDLE VALID NEW SESSION / USER CHANGED
      console.log(`[CREWZI] Processing state change for user: ${session.user.id}`);
      lastProcessedUserId.current = session.user.id;
      setUser(session.user);
      
      // Await network query before flipping flags to prevent partial rendering states
      await fetchProfile(session.user.id);

      setLoading(false);
      setAuthInitialized(true);
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

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}