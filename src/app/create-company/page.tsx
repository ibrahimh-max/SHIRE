'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">
            Create Your Company
          </h1>

          {error && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block mb-1 font-medium">
                Company Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g. Taj Hotel"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Company Type
              </label>

              <select
                name="company_type"
                value={formData.company_type}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Type</option>
                <option value="Restaraunt">Hotel</option>
                <option value="Theme Park">Restaurant</option>
                <option value="Resort">Cafe</option>
                <option value="Startup">Catering</option>
                <option value="MNC">Event Venue</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g. Hyderabad"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Describe your company..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? 'Creating...' : 'Create Company'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}