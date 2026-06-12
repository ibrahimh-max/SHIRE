'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
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

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,

        options: {
          emailRedirectTo: `${window.location.origin}/app/dashboard`,

          data: {
            name: formData.name,
            role: formData.role,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/app/login');
      }, 4000);

    } catch {

      setError('Something went wrong. Please try again.');

    } finally {

      setLoading(false);

    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">

      <Navigation />

      <div className="flex items-center justify-center py-16 px-4">

        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-primary/10">

          {/* Header */}
          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-foreground">
              Join CREWZI
            </h1>

            <p className="text-foreground/60 mt-2">
              Start your hospitality journey
            </p>

          </div>

          {/* Success */}
          {success && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">

              <h3 className="font-semibold text-green-700 mb-1">
                ✅ Verification email sent
              </h3>

              <p className="text-sm text-green-700">
                Please check your inbox and click the verification link
                to activate your account.
              </p>

            </div>
          )}

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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />

            </div>

            {/* Role */}
            <div>

              <label
                htmlFor="role"
                className="block text-sm font-medium text-foreground/80 mb-1"
              >
                I am a
              </label>

              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
              >
                <option value="worker">
                  💼 Worker looking for jobs
                </option>

                <option value="employer">
                  🏢 Employer hiring staff
                </option>

              </select>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {loading
                ? 'Creating account...'
                : success
                  ? 'Verification Email Sent'
                  : 'Create account'}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 text-center">

            <p className="text-sm text-foreground/60">

              Already have an account?{' '}

              <a
                href="/app/login"
                className="text-primary hover:text-primary-dark font-medium"
              >
                Sign in
              </a>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
