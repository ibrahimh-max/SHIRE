'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';

export default function Signup() {

  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker' as 'worker' | 'employer',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError('');
    }
  };


  // Email Signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          },
        },
      });

      console.log('SIGNUP DATA:', data);
      console.log('SIGNUP ERROR:', error);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('SIGNUP EXCEPTION:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Success State */}
          {success ? (
            <div className="card-surface p-10 text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-primary/20">
                ✉️
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Almost there!
              </h2>
              <p className="text-foreground/70 mb-4">
                We've sent a verification link to <strong>{formData.email}</strong>.
              </p>
              <p className="text-foreground/70 mb-4">
                Please verify your email before signing in.
              </p>
              <p className="text-sm text-foreground/50 mb-8 italic">
                Check your Spam/Junk folder if you don't see the email.
              </p>
              
              <div className="space-y-3">
                <a 
                  href="https://mail.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center py-3 rounded-xl font-bold block"
                >
                  Open Gmail
                </a>
                
                <button 
                  onClick={async () => {
                    try {
                      await supabase.auth.resend({ type: 'signup', email: formData.email });
                      alert('Verification email resent! Please check your inbox.');
                    } catch(e) {
                      console.error(e);
                    }
                  }}
                  className="w-full py-3 rounded-xl border-2 border-gray-100 font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all text-foreground"
                >
                  Resend Verification Email
                </button>
                
                <button 
                  onClick={() => router.push('/app/login')}
                  className="w-full py-3 text-foreground/70 font-medium hover:text-foreground transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <div className="card-surface p-8">
              {/* Heading */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Create an account
                </h2>
                <p className="text-foreground/60 mt-1.5">
                  Start your hospitality journey
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground/80 mb-1"
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

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
                    Password (min. 6 characters)
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'worker' })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        formData.role === 'worker' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl mb-2">💼</span>
                      <span className="font-semibold text-sm">Talent</span>
                      <span className="text-xs opacity-70 mt-0.5">Looking for jobs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'employer' })}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        formData.role === 'employer' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl mb-2">🏢</span>
                      <span className="font-semibold text-sm">Employer</span>
                      <span className="text-xs opacity-70 mt-0.5">Hiring staff</span>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </button>

              </form>
            </div>
          )}

          {/* Footer */}
          {!success && (
            <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-foreground/60 font-medium">
                Already have an account?{' '}
                <a
                  href="/app/login"
                  className="text-primary hover:text-primary-dark font-bold ml-1 transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}