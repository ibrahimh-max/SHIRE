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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading...</p>
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
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-4xl mb-4">
            🏢
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {hasCompany ? 'Edit Company' : 'Create Company'}
          </h1>
          {/* Fix 3: Better header copy */}
          <p className="text-foreground/60 mt-2">
            {hasCompany 
              ? 'Update your company profile' 
              : 'Create your company profile and start inviting hospitality talent for interview'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-primary/10 p-5">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Company Name */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-foreground">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-primary/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Taj Hotel"
              />
            </div>

            {/* Company Type */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-foreground">
                Business Type *
              </label>
              <select
                name="company_type"
                value={formData.company_type}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-primary/20 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
              <label className="block mb-2 text-sm font-semibold text-foreground">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-primary/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Hyderabad"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-foreground">
                About Your Business
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-primary/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Tell workers about your hotel, restaurant, cafe, or business..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="font-medium text-primary">
                Hiring Starts Here
              </p>
              <p className="text-sm text-foreground/60 mt-1">
                Once your company is created, you'll be able to browse talent and send interview invitations.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {hasCompany ? 'Updating Company...' : 'Creating Company...'}
                </span>
              ) : (
                hasCompany ? 'Update Company' : 'Create Company'
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}