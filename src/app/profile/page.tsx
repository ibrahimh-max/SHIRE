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
  experience: string;
  availability: 'Full Time' | 'Part Time' | 'Both' | '';
  preferred_role: 'Waiter' | 'Chef' | 'Kitchen Helper' | 'Receptionist' | 'Housekeeping' | 'Barista' | 'Delivery Staff' | '';
  photo_url: string;
  resume_url: string;
  is_available: boolean;
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
    experience: '',
    availability: '',
    preferred_role: '',
    photo_url: '',
    resume_url: '',
    is_available: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Handle authentication redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/login');
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
        experience: profile.experience || '',
        availability: profile.availability || '',
        preferred_role: profile.preferred_role || '',
        photo_url: profile.photo_url || '',
        resume_url: profile.resume_url || '',
        is_available: profile.is_available ?? true,
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setResumeError('Only PDF files are allowed');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setResumeError('File size must be less than 5MB');
      return;
    }

    setResumeUploading(true);
    setResumeError('');

    try {
      // Generate unique filename
      const fileExt = 'pdf';
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        setResumeError('Failed to upload resume');
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrlData.publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        setResumeError('Failed to save resume URL');
        return;
      }

      setFormData(prev => ({ ...prev, resume_url: publicUrlData.publicUrl }));
      await refreshProfile();
      setSuccessMessage('Resume uploaded successfully!');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setResumeError('Failed to upload resume');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!formData.resume_url) return;

    try {
      // Extract filename from URL
      const urlParts = formData.resume_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `resumes/${fileName}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove([filePath]);

      if (deleteError) {
        setResumeError('Failed to delete resume');
        return;
      }

      // Update profile to remove resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: null })
        .eq('id', user?.id);

      if (updateError) {
        setResumeError('Failed to remove resume');
        return;
      }

      setFormData(prev => ({ ...prev, resume_url: '' }));
      await refreshProfile();
      setSuccessMessage('Resume deleted successfully!');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setResumeError('Failed to delete resume');
    }
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
          experience: formData.experience || null,
          availability: formData.availability || null,
          preferred_role: formData.preferred_role || null,
          photo_url: formData.photo_url || null,
          resume_url: formData.resume_url || null,
          is_available: formData.is_available,
        })
        .eq('id', user?.id);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccessMessage('Profile updated successfully!');
      await refreshProfile();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
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
              Worker Profile
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
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

              {/* Experience */}
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-foreground mb-2">
                  Work Experience
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="Describe your work experience..."
                />
              </div>

              {/* Availability */}
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-foreground mb-2">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
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
                  Preferred Role
                </label>
                <select
                  id="preferred_role"
                  name="preferred_role"
                  value={formData.preferred_role}
                  onChange={handleChange}
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

              {/* Photo URL */}
              <div>
                <label htmlFor="photo_url" className="block text-sm font-medium text-foreground mb-2">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  id="photo_url"
                  name="photo_url"
                  value={formData.photo_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              {/* Resume Upload Section */}
              <div className="p-4 bg-background/50 rounded-xl">
                <h3 className="font-medium text-foreground mb-3">Resume (PDF)</h3>
                
                {resumeError && (
                  <div className="mb-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {resumeError}
                  </div>
                )}

                {!formData.resume_url ? (
                  <div>
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      disabled={resumeUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume"
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer ${
                        resumeUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {resumeUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-foreground/60">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">📄</span>
                          <span className="text-foreground/70">Upload Resume (PDF)</span>
                        </>
                      )}
                    </label>
                    <p className="text-xs text-foreground/40 mt-2">
                      Maximum file size: 5MB. Only PDF files allowed.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <p className="font-medium text-foreground text-green-600">
                          Resume Uploaded
                        </p>
                        <p className="text-xs text-foreground/40">
                          PDF file stored securely
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <label
                        htmlFor="resume"
                        className="px-3 py-1.5 text-sm rounded-lg border border-primary/20 text-foreground/70 hover:border-primary hover:text-foreground transition-all cursor-pointer"
                      >
                        Replace
                      </label>
                      <button
                        type="button"
                        onClick={handleResumeDelete}
                        className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                      >
                        Delete
                      </button>
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                        disabled={resumeUploading}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
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
