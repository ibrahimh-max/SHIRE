'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ProfileFormData {
  name: string;
  phone: string;
  age: string;
  address: string;
  location: string;
  availability: 'Full Time' | 'Part Time' | 'Both' | '';
  preferred_role: 'Waiter' | 'Chef' | 'Kitchen Helper' | 'Receptionist' | 'Housekeeping' | 'Barista' | 'Delivery Staff' | '';
  is_available: boolean;
  hospitality_experience: string;
  start_availability: string;
}

export default function ProfilePage() {
  const { user, profile, loading, authInitialized, refreshProfile, signOut } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    age: '',
    address: '',
    location: '',
    availability: '',
    preferred_role: '',
    is_available: true,
    hospitality_experience: '',
    start_availability: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/app/login');
      return;
    }
  }, [user, loading, authInitialized, router]);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        age: profile.age ? profile.age.toString() : '',
        address: profile.address || '',
        location: profile.location || '',
        availability: profile.availability || '',
        preferred_role: profile.preferred_role || '',
        is_available: profile.is_available ?? true,
        hospitality_experience: profile.hospitality_experience || '',
        start_availability: profile.start_availability || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          age: formData.age ? parseInt(formData.age) : null,
          address: formData.address || null,
          location: formData.location || null,
          availability: formData.availability || null,
          preferred_role: formData.preferred_role || null,
          is_available: formData.is_available,
          hospitality_experience: formData.hospitality_experience || null,
          start_availability: formData.start_availability || null,
        })
        .eq('id', user?.id);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccessMessage('✅ Profile saved successfully');
      
      // Refresh profile in background, don't block UI
      refreshProfile().catch(console.error);

      // Redirect immediately
      router.push('/app/dashboard');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    setError('');

    try {
      const { error: invError } = await supabase
        .from('interview_invitations')
        .delete()
        .or(`worker_id.eq.${user.id},employer_id.eq.${user.id}`);
      if (invError) throw invError;

      const { error: compError } = await supabase
        .from('companies')
        .delete()
        .eq('owner_id', user.id);
      if (compError) throw compError;

      const { error: profError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      if (profError) throw profError;

      await signOut();
      router.push('/app/login');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Initial auth loading (non-blocking UI)
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="py-8 px-4 max-w-md mx-auto space-y-6">
          <div className="flex flex-col items-center mb-8 space-y-4">
            <div className="skeleton w-24 h-24 rounded-full"></div>
            <div className="skeleton h-8 w-48"></div>
            <div className="skeleton h-4 w-32"></div>
          </div>
          <div className="space-y-4">
            <div className="skeleton h-20 w-full"></div>
            <div className="skeleton h-40 w-full"></div>
            <div className="skeleton h-40 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-4">
        {/* CHANGE 1: Mobile-first container */}
        <div className="max-w-md mx-auto">

          {/* Profile header with avatar */}
          <div className="flex flex-col items-center text-center mb-8 animate-fade-in-up">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-4xl text-white font-bold shadow-lg ring-4 ring-white mb-4">
                {formData.name ? formData.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <button className="absolute bottom-4 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-primary hover:bg-gray-50 transition-colors border border-gray-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </button>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {formData.name || 'Your Profile'}
            </h1>
            <p className="text-primary mt-1 font-bold">
              {formData.preferred_role || 'Hospitality Talent'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 font-medium animate-fade-in-up">
              {successMessage}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

            {/* Availability toggle */}
            <div className="card-surface p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Available For Hiring</h3>
                <p className="text-sm text-foreground/60 mt-0.5">Employers can discover and invite you</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-success shadow-inner"></div>
              </label>
            </div>

            {/* Personal Information Block */}
            <div className="card-surface p-5">
              <h3 className="font-bold text-lg text-foreground mb-4">Personal Info</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-foreground mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-foreground mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-bold text-foreground mb-1.5">
                      Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="16"
                      max="100"
                      className="input-field"
                      placeholder="e.g. 25"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-bold text-foreground mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-bold text-foreground mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            </div>

            {/* Hospitality Information Block */}
            <div className="card-surface p-5">
              <h3 className="font-bold text-lg text-foreground mb-4">Hospitality Info</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="preferred_role" className="block text-sm font-bold text-foreground mb-1.5">
                    Preferred Role *
                  </label>
                  <select
                    id="preferred_role"
                    name="preferred_role"
                    value={formData.preferred_role}
                    onChange={handleChange}
                    required
                    className="input-field bg-white"
                  >
                    <option value="">Select preferred role</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Chef">Chef</option>
                    <option value="Kitchen Helper">Kitchen Helper</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Barista">Barista</option>
                    <option value="Delivery Staff">Delivery Staff</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hospitality_experience" className="block text-sm font-bold text-foreground mb-1.5">
                    Hospitality Experience *
                  </label>
                  <select
                    id="hospitality_experience"
                    name="hospitality_experience"
                    value={formData.hospitality_experience}
                    onChange={handleChange}
                    required
                    className="input-field bg-white"
                  >
                    <option value="">Select experience</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Less than 1 Year">Less than 1 Year</option>
                    <option value="1-3 Years">1-3 Years</option>
                    <option value="3+ Years">3+ Years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-bold text-foreground mb-1.5">
                    Availability *
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    required
                    className="input-field bg-white"
                  >
                    <option value="">Select availability</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="start_availability" className="block text-sm font-bold text-foreground mb-1.5">
                    How soon can you start? *
                  </label>
                  <select
                    id="start_availability"
                    name="start_availability"
                    value={formData.start_availability}
                    onChange={handleChange}
                    required
                    className="input-field bg-white"
                  >
                    <option value="">Select start date</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 1 Week">Within 1 Week</option>
                    <option value="Within 2 Weeks">Within 2 Weeks</option>
                    <option value="Within 1 Month">Within 1 Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button - Sticky at bottom */}
            <div className="sticky bottom-20 z-10 pt-4 pb-2 bg-background/80 backdrop-blur-md">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary w-full shadow-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Save Profile
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Account Settings & Danger Section */}
          <div className="mt-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-surface p-5 border-red-100">
              <h3 className="font-bold text-lg text-danger mb-2">Danger Zone</h3>
              <p className="text-sm text-foreground/60 mb-5">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
              >
                Delete Account
              </button>
            </div>

            {/* Version */}
            <div className="text-center pb-8">
              <p className="text-sm font-bold text-foreground/30">CREWZI v1.0</p>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Account</h3>
            <p className="text-foreground/70 mb-6">
              Are you sure you want to permanently delete your account?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl border border-primary/20 text-foreground font-medium hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}