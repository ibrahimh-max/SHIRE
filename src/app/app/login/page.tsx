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

  const router = useRouter();

  // Ensure client-side rendering only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in - Disabled during development for easier account switching
  useEffect(() => {
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
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setError('email_not_confirmed');
        } else {
          setError(error.message);
        }
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
            {error && error !== 'email_not_confirmed' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {error === 'email_not_confirmed' && (
              <div className="mb-6 p-5 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <div className="text-3xl mb-2">✉️</div>
                <h3 className="font-bold text-foreground mb-2">Email Not Verified</h3>
                <p className="text-sm text-foreground/70 mb-5">
                  Please check your inbox and verify your email before signing in.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await supabase.auth.resend({ type: 'signup', email: formData.email });
                      alert('Verification email resent! Please check your inbox.');
                    } catch(e) {
                      console.error(e);
                    }
                  }}
                  className="w-full py-2.5 bg-white border-2 border-primary/20 text-primary font-semibold rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-sm shadow-sm"
                >
                  Resend Verification Email
                </button>
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
                disabled={submitting || redirecting}
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