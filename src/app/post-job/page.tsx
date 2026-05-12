'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function PostJob() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pay: '',
    location: '',
    job_type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'temporary',
    shift_timing: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible',
    workers_needed: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  // Redirect workers away from this page
  useEffect(() => {
    if (!loading && profile && profile.role !== 'employer') {
      router.push('/dashboard');
    }
  }, [profile, loading, router]);

  // Fetch employer's companies
  useEffect(() => {
    if (user && profile?.role === 'employer') {
      fetchCompanies();
    }
  }, [user, profile]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id);

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (err) {
      console.error('Error in fetchCompanies:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'workers_needed' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!selectedCompany) {
      setError('Please select a company or create one first');
      setSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          company_id: selectedCompany,
          title: formData.title,
          description: formData.description,
          pay: formData.pay,
          location: formData.location,
          job_type: formData.job_type,
          shift_timing: formData.shift_timing,
          workers_needed: formData.workers_needed
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/dashboard?message=Job posted successfully');
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'employer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a Job</h1>
          
          {companies.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Company Found</h3>
              <p className="text-yellow-700 mb-4">
                You need to create a company before posting jobs.
              </p>
              <button
                onClick={() => router.push('/create-company')}
                className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
              >
                Create Company
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
                  {error}
                </div>
              )}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <select
                      id="company"
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    >
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="e.g. Front Desk Receptionist"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Describe the role, responsibilities, and requirements..."
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pay" className="block text-sm font-medium text-gray-700 mb-1">
                        Pay
                      </label>
                      <input
                        type="text"
                        id="pay"
                        name="pay"
                        value={formData.pay}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="e.g. $18/hour or $45,000/year"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="e.g. New York, NY"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-1">
                        Job Type
                      </label>
                      <select
                        id="job_type"
                        name="job_type"
                        value={formData.job_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="shift_timing" className="block text-sm font-medium text-gray-700 mb-1">
                        Shift Timing
                      </label>
                      <select
                        id="shift_timing"
                        name="shift_timing"
                        value={formData.shift_timing}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="workers_needed" className="block text-sm font-medium text-gray-700 mb-1">
                        Workers Needed
                      </label>
                      <input
                        type="number"
                        id="workers_needed"
                        name="workers_needed"
                        value={formData.workers_needed}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-primary text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark transition-colors disabled:bg-primary/50 font-medium shadow-sm"
                    >
                      {submitting ? 'Posting Job...' : 'Post Job'}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}