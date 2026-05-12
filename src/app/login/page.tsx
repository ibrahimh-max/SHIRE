'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Login() {
  const { user, loading, authInitialized } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for message in URL parameters
  useEffect(() => {
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  // Handle redirect if user is already logged in
  useEffect(() => {
    // Only redirect if auth is initialized and user exists
    if (authInitialized && user && !redirecting) {
      setRedirecting(true);
      router.push('/dashboard');
    }
  }, [user, loading, authInitialized, router, redirecting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setRedirecting(true);

    try {
      // Step 1: Authenticate user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setError(error.message);
        setRedirecting(false);
        setSubmitting(false);
        return;
      }
      
      // Step 2: Wait for auth context to be fully initialized with the new session
      let attempts = 0;
      let sessionVerified = false;
      
      while (attempts < 15 && !sessionVerified) { // 3 seconds max
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
        
        // Check if session is established
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.id === data.user?.id) {
          sessionVerified = true;
          break;
        }
      }
      
      if (!sessionVerified) {
        setError('Login successful but session verification failed. Please try again.');
        setRedirecting(false);
        setSubmitting(false);
        return;
      }
      
      // Step 3: Wait a bit more for auth context to fully initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 4: Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setRedirecting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-primary/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-foreground/60 mt-2">Sign in to your account</p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || redirecting}
              className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-primary-dark transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting || redirecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {redirecting ? 'Redirecting...' : 'Signing in...'}
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-foreground/60">
              Don't have an account?{' '}
              <a href="/signup" className="text-primary hover:text-primary-dark font-medium">
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}