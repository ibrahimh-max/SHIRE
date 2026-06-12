'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
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
  const { user, profile, loading, authInitialized, refreshProfile } = useAuth();
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
      await refreshProfile();

      setTimeout(() => {
        router.push('/app/dashboard');
      }, 1500);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Initial auth loading
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60">Loading your account...</p>
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
      <Navigation />

      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Candidate Profile
            </h1>
            <p className="text-foreground/60 mt-2">
              Update your profile information
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700">
              {successMessage}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
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
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your age"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your address"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  City/Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your city"
                />
              </div>

              {/* Hospitality Experience */}
              <div>
                <label htmlFor="hospitality_experience" className="block text-sm font-medium text-foreground mb-2">
                  Hospitality Experience *
                </label>
                <select
                  id="hospitality_experience"
                  name="hospitality_experience"
                  value={formData.hospitality_experience}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                >
                  <option value="">Select experience</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Less than 1 Year">Less than 1 Year</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3+ Years">3+ Years</option>
                </select>
              </div>

              {/* Start Availability */}
              <div>
                <label htmlFor="start_availability" className="block text-sm font-medium text-foreground mb-2">
                  How soon can you start? *
                </label>
                <select
                  id="start_availability"
                  name="start_availability"
                  value={formData.start_availability}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                >
                  <option value="">Select start date</option>
                  <option value="Immediately">Immediately</option>
                  <option value="Within 1 Week">Within 1 Week</option>
                  <option value="Within 2 Weeks">Within 2 Weeks</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-foreground mb-2">
                  Availability *
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                >
                  <option value="">Select availability</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              {/* Preferred Role */}
              <div>
                <label htmlFor="preferred_role" className="block text-sm font-medium text-foreground mb-2">
                  Preferred Role *
                </label>
                <select
                  id="preferred_role"
                  name="preferred_role"
                  value={formData.preferred_role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
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

              {/* Is Available Toggle */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                <div>
                  <h3 className="font-medium text-foreground">Available for Work</h3>
                  <p className="text-sm text-foreground/60">Toggle your availability status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
