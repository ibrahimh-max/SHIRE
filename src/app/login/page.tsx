'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

export default function Login() {
  const { user, authInitialized } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (authInitialized && user && !redirecting) {
      setRedirecting(true);
      router.push('/dashboard');
    }
  }, [authInitialized, user, redirecting, router]);

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

      router.push('/dashboard');

    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-primary/10">

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back
            </h1>

            <p className="text-foreground/60 mt-2">
              Sign in to your SHIRE account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || redirecting}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-foreground/60">
              Don&apos;t have an account?{' '}
              <a
                href="/signup"
                className="text-primary hover:text-primary-dark font-medium"
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