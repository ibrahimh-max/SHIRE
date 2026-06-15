'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { user, authInitialized } = useAuth();

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // ✅ NEW

  const router = useRouter();

  // Ensure client-side rendering only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in - Disabled during development for easier account switching
  useEffect(() => {
    // Disabled during development for easier account switching
    if (
      process.env.NODE_ENV === 'production' &&
      mounted &&
      authInitialized &&
      user &&
      !redirecting
    ) {
      setRedirecting(true);
      router.push('/app/dashboard');
    }
  }, [mounted, authInitialized, user, redirecting, router]);

  // ✅ ADD THIS FUNCTION - Google Sign In
const signInWithGoogle = async () => {

  try {

    setGoogleLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',

      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
        prompt: 'select_account',
},
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }

  } catch {

    setError('Failed to sign in with Google.');
    setGoogleLoading(false);

  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        setSubmitting(false);
        return;
      }

      router.push('/app/dashboard');

    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  // Prevent prerender mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-primary-dark"></div>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          
          {/* Brand Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-primary tracking-tight mb-2">CREWZI</h1>
            <p className="text-foreground/70 font-medium tracking-wide text-sm uppercase">Hospitality Hiring, Simplified</p>
          </div>

          <div className="card-surface p-8">

            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back
              </h2>
              <p className="text-foreground/60 mt-1.5">
                Sign in to your account
              </p>
            </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Account Switch Button */}
          {user && (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="mb-4 w-full border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50"
            >
              Sign Out Current Account
            </button>
          )}

          {/* ✅ NEW: Google Sign In Button */}
          <button
            onClick={signInWithGoogle}
            disabled={googleLoading || submitting || redirecting}
            className="w-full border-2 border-gray-100 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all mb-5 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed text-foreground/80"
          >
            {googleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                Redirecting...
              </>
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground/80 mb-1"
              >
                Email address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground/80 mb-1"
              >
                Password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || redirecting || googleLoading}
              className="btn-primary mt-2"
            >
              {submitting || redirecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

          </div>

          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-foreground/60 font-medium">
              Don&apos;t have an account?{' '}
              <a
                href="/app/signup"
                className="text-primary hover:text-primary-dark font-bold ml-1 transition-colors"
              >
                Create account
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}