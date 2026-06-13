'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function CreateCompanyPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    company_type: '',
    location: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prevent workers
  if (profile?.role !== 'employer') {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('companies')
        .insert({
          owner_id: user.id,
          name: formData.name,
          company_type: formData.company_type,
          location: formData.location,
          description: formData.description,
        });

      if (error) {
        console.error(error);
        setError(error.message);
        return;
      }

      router.push('/app/candidates');
    } catch (err) {
      console.error(err);
      setError('Failed to create company');
    } finally {
      setLoading(false);
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
          Create Company
        </h1>

        <p className="text-foreground/60 mt-2">
          Set up your business profile and start hiring workers.
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
              Company Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-primary/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Taj Hotel"
            />
          </div>

          {/* Company Type */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-foreground">
              Business Type
            </label>

            <select
              name="company_type"
              value={formData.company_type}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-primary/20 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Type</option>
              <option value="Hotel">Hotel</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
              <option value="Catering">Catering</option>
              <option value="Event Venue">Event Venue</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-foreground">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-primary/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              required
              className="w-full rounded-xl border border-primary/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Tell workers about your hotel, restaurant, cafe, or business..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 rounded-xl p-4">

            <p className="font-medium text-primary">
              Hiring Starts Here
            </p>

            <p className="text-sm text-foreground/60 mt-1">
              Once your company is created, you'll be able to browse workers and send interview invitations.
            </p>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading
              ? 'Creating Company...'
              : 'Create Company'}
          </button>

        </form>

      </div>

    </div>

  </div>
);