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
  const fetchProfile = async (userId: string, retries = 8) => {
    console.log('🔍 Fetching profile for user:', userId);
    console.log('📋 Profile fetch start:', { userId, retries, timestamp: new Date().toISOString() });
    
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 Profile fetch attempt ${i + 1}/${retries}...`);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // Handle case where profile doesn't exist (not an error with maybeSingle)
        if (error) {
          console.error(`❌ Error fetching profile (attempt ${i + 1}):`, error);
          console.log('📋 Profile error details:', {
            attempt: i + 1,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          if (i === retries - 1) {
            console.log('⚠️ Failed to fetch profile after retries');
            console.log('📋 Profile fetch failed:', { 
              userId, 
              totalAttempts: retries,
              finalError: error.message
            });
          } else {
            console.log(`⏳ Waiting before retry ${i + 2}...`);
            await new Promise(resolve => setTimeout(resolve, 800)); // Wait before retry
          }
          continue;
        }

        // Handle case where profile doesn't exist (data is null with maybeSingle)
        if (!data) {
          console.log('ℹ️ Profile does not exist for user:', userId);
          console.log('📋 Profile missing details:', { 
            userId, 
            attempt: i + 1,
            isNull: true,
            waitingForTrigger: i < retries - 1
          });
          
          if (i === retries - 1) {
            console.log('⚠️ Profile confirmed missing after all retries - backend trigger may have failed');
            console.log('📋 Final status: Profile does not exist');
            setProfile(null); // Explicitly set to null when profile is missing
          } else {
            console.log(`⏳ Waiting for backend trigger to create profile... retry ${i + 2}`);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          continue;
        }

        console.log('✅ Profile fetched successfully:', data);
        console.log('📋 Profile data:', {
          id: data.id,
          name: data.name,
          role: data.role,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          fetchAttempt: i + 1
        });
        setProfile(data);
        console.log('🏁 Profile fetch completed successfully');
        return data;
      } catch (err) {
        console.error(`❌ Exception in fetchProfile (attempt ${i + 1}):`, err);
        console.log('📋 Profile exception details:', {
          attempt: i + 1,
          error: err,
          errorMessage: err instanceof Error ? err.message : 'Unknown error'
        });
        
        if (i === retries - 1) {
          console.log('⚠️ Exception in fetchProfile after retries');
          console.log('📋 Profile fetch failed with exception:', { 
            userId, 
            totalAttempts: retries,
            finalException: err
          });
        } else {
          console.log(`⏳ Waiting before retry ${i + 2}...`);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    }
    
    console.log('🏁 Profile fetch completed (no success) - backend trigger may be delayed');
    setProfile(null); // Ensure profile is null if not found
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile for user:', user.id);
      console.log('📋 Profile refresh start:', { userId: user.id, timestamp: new Date().toISOString() });
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
    console.log('📋 Auth initialization start:', { timestamp: new Date().toISOString() });
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          console.log('📋 Session error details:', { code: error.code, message: error.message });
          setLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Session found for user:', session.user.id);
          console.log('📋 Session info:', {
            userId: session.user.id,
            email: session.user.email,
            lastSignInAt: session.user.last_sign_in_at,
            createdAt: session.user.created_at
          });
          setUser(session.user);
          console.log('🔄 Fetching profile for authenticated user...');
          await fetchProfile(session.user.id);
        } else {
          console.log('ℹ️ No session found');
          console.log('📋 No session - user needs to login');
        }
      } catch (err) {
        console.error('❌ Exception getting initial session:', err);
        console.log('📋 Session exception:', err);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
        console.log('🏁 Auth initialization complete');
        console.log('📋 Auth initialization end:', { 
          timestamp: new Date().toISOString(),
          hasUser: !!user,
          hasProfile: !!profile
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', { 
          event, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
        
        if (session?.user) {
          console.log('✅ User signed in:', session.user.id);
          console.log('📋 Sign in details:', {
            userId: session.user.id,
            email: session.user.email,
            isNewUser: !user || user.id !== session.user.id
          });
          setUser(session.user);
          console.log('🔄 Fetching profile after sign in...');
          await fetchProfile(session.user.id);
        } else {
          console.log('ℹ️ User signed out');
          console.log('📋 Sign out details:', {
            previousUserId: user?.id,
            hadProfile: !!profile
          });
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
