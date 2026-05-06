'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface JobWithCompany {
  id: string;
  title: string;
  description: string;
  pay: string;
  job_type: string;
  location: string;
  shift_timing: string;
  workers_needed: number;
  created_at: string;
  companies: {
    name: string;
  };
  applications?: {
    id: string;
    status: string;
  }[];
}

export default function Jobs() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  // Fetch jobs from Supabase
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies(name),
          applications(id, status, user_id)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      // Process jobs data
      let processedJobs = data || [];
      if (user && profile?.role === 'worker') {
        processedJobs = data?.map(job => ({
          ...job,
          applications: job.applications?.filter((app: any) => app.user_id === user.id) || []
        })) || [];
      }

      setJobs(processedJobs);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  // Handle job application
  const handleApply = async (jobId: string) => {
    if (!user || profile?.role !== 'worker') {
      setError('Only workers can apply for jobs');
      return;
    }

    setApplying(jobId);

    try {
      // Check if already applied
      const job = jobs.find(j => j.id === jobId);
      if (job?.applications && job.applications.length > 0) {
        setError('You have already applied for this job');
        setApplying(null);
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setError('You have already applied for this job');
        } else {
          setError(error.message);
        }
        return;
      }

      // Refresh jobs to update application status
      await fetchJobs();
    } catch (err) {
      setError('Failed to apply for job');
    } finally {
      setApplying(null);
    }
  };

  // Get shift timing display text
  const getShiftTimingText = (timing: string) => {
    const shiftMap: { [key: string]: string } = {
      'morning': 'Morning',
      'afternoon': 'Afternoon',
      'evening': 'Evening',
      'night': 'Night',
      'flexible': 'Flexible'
    };
    return shiftMap[timing] || timing;
  };

  // Get job type display text
  const getJobTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'temporary': 'Temporary'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Hospitality Jobs</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}
          
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No jobs available at the moment.</p>
              <p className="text-gray-500 mt-2">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const hasApplied = job.applications && job.applications.length > 0;
                
                return (
                  <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                    <p className="text-gray-600 mb-1">{job.companies?.name || 'Company'}</p>
                    <p className="text-gray-500 text-sm mb-3">{job.location}</p>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 font-semibold">{job.pay}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {getJobTypeText(job.job_type)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {getShiftTimingText(job.shift_timing)}
                        </span>
                        <span className="text-gray-600">
                          {job.workers_needed} worker{job.workers_needed > 1 ? 's' : ''} needed
                        </span>
                      </div>
                    </div>
                    
                    {user && profile?.role === 'worker' ? (
                      hasApplied ? (
                        <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-md text-center font-medium">
                          ✓ Applied ({job.applications![0].status})
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={applying === job.id}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        >
                          {applying === job.id ? 'Applying...' : 'Apply Now'}
                        </button>
                      )
                    ) : user ? (
                      <div className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center text-sm">
                        Only workers can apply
                      </div>
                    ) : (
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Login to Apply
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
