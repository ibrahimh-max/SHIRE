'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function CreateCompanyPage() {
  const { user, profile, loading, authInitialized } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    company_type: '',
    location: '',
    description: '',
  });

  // Fix 1: Renamed to avoid naming conflict
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);

  // Handle authentication and redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/app/login');
      return;
    }

    // Redirect workers away from this page
    if (profile && profile.role !== 'employer') {
      router.push('/app/dashboard');
      return;
    }

    // Check if user already has a company
    const checkExistingCompany = async () => {
      if (!user) return;
      
      try {
        const { data: companyData, error } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (companyData) {
          setHasCompany(true);
          setFormData({
            name: companyData.name || '',
            company_type: companyData.company_type || '',
            location: companyData.location || '',
            description: companyData.description || '',
          });
        }
      } catch (err) {
        console.error('Error checking company:', err);
      } finally {
        setCheckingCompany(false);
      }
    };

    if (profile && profile.role === 'employer') {
      checkExistingCompany();
    } else {
      setCheckingCompany(false);
    }
  }, [user?.id, profile?.role, loading, authInitialized, router]);

  // Show loading while checking auth, profile, and company
  // Fix 5: Also wait for profile to arrive — prevents blank page race condition
  // when authInitialized becomes true before fetchProfile completes
  if (loading || !authInitialized || !profile || checkingCompany) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col items-center mb-8 space-y-4">
            <div className="skeleton w-24 h-24 rounded-full"></div>
            <div className="skeleton h-8 w-48"></div>
            <div className="skeleton h-4 w-64"></div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-20 w-full"></div>
            <div className="skeleton h-20 w-full"></div>
            <div className="skeleton h-20 w-full"></div>
            <div className="skeleton h-32 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Prevent rendering if not employer (though redirect should handle it)
  if (!user || profile?.role !== 'employer') {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (hasCompany) {
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            name: formData.name.trim(),
            company_type: formData.company_type,
            location: formData.location.trim(),
            description: formData.description.trim(),
          })
          .eq('owner_id', user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('companies')
          .insert({
            owner_id: user.id,
            name: formData.name.trim(),
            company_type: formData.company_type,
            location: formData.location.trim(),
            description: formData.description.trim(),
          });

        if (insertError) throw insertError;
      }

      // Success - redirect immediately
      router.push('/app/candidates');

    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err?.message || 'Failed to save company. Please try again.');
    } finally {
      // Always reset submitting state so button is never permanently disabled
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-5xl text-white shadow-lg ring-4 ring-white mb-4">
            🏢
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {hasCompany ? 'Edit Company' : 'Create Company'}
          </h1>
          <p className="text-foreground/60 mt-2 font-medium">
            {hasCompany 
              ? 'Update your company profile' 
              : 'Create your company profile and start inviting hospitality talent for interview'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-medium animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="card-surface p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Company Name */}
            <div>
              <label className="block mb-1.5 text-sm font-bold text-foreground">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Taj Hotel"
              />
            </div>

            {/* Company Type */}
            <div>
              <label className="block mb-1.5 text-sm font-bold text-foreground">
                Business Type *
              </label>
              <select
                name="company_type"
                value={formData.company_type}
                onChange={handleChange}
                required
                className="input-field bg-white"
              >
                <option value="">Select Type</option>
                <option value="Hotel">Hotel</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Cafe">Cafe</option>
                <option value="Catering">Catering</option>
                <option value="Event Venue">Event Venue</option>
                <option value="Cloud Kitchen">Cloud Kitchen</option>
                <option value="Bar">Bar</option>
                <option value="Resort">Resort</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block mb-1.5 text-sm font-bold text-foreground">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g. Hyderabad"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1.5 text-sm font-bold text-foreground">
                About Your Business
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field resize-none"
                placeholder="Tell workers about your hotel, restaurant, cafe, or business..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="font-bold text-primary">
                Hiring Starts Here
              </p>
              <p className="text-sm text-foreground/60 mt-1 font-medium">
                Once your company is created, you'll be able to browse talent and send interview invitations.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {hasCompany ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {hasCompany ? 'Update Company' : 'Create Company'}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}