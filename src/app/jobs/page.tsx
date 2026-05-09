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
  const [filteredJobs, setFilteredJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [uniqueJobTypes, setUniqueJobTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search and filter criteria
  useEffect(() => {
    let filtered = jobs;

    // Search filter (job title and company name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.companies?.name.toLowerCase().includes(searchLower)
      );
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    // Job type filter
    if (selectedJobType) {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedLocation, selectedJobType, jobs]);

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

      let processedJobs = data || [];
      if (user && profile?.role === 'worker') {
        processedJobs = data?.map(job => ({
          ...job,
          applications: job.applications?.filter((app: any) => app.user_id === user.id) || []
        })) || [];
      }

      setJobs(processedJobs);
      setFilteredJobs(processedJobs);

      // Extract unique locations and job types for filters
      const locations = [...new Set(processedJobs.map(job => job.location).filter(Boolean))];
      const jobTypes = [...new Set(processedJobs.map(job => job.job_type).filter(Boolean))];
      setUniqueLocations(locations);
      setUniqueJobTypes(jobTypes);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user || profile?.role !== 'worker') {
      setError('Only workers can apply for jobs');
      return;
    }

    setApplying(jobId);

    try {
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

      await fetchJobs();
    } catch (err) {
      setError('Failed to apply for job');
    } finally {
      setApplying(null);
    }
  };

  const getShiftTimingText = (timing: string) => {
    const shiftMap: { [key: string]: string } = {
      'morning': '🌅 Morning',
      'afternoon': '☀️ Afternoon',
      'evening': '🌙 Evening',
      'night': '🌃 Night',
      'flexible': '🕒 Flexible'
    };
    return shiftMap[timing] || timing;
  };

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
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-2">Find your next role</h1>
            <p className="text-foreground/60">Hospitality jobs waiting for you</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search Bar */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location Filter */}
              <div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Type Filter */}
              <div>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {uniqueJobTypes.map(jobType => (
                    <option key={jobType} value={jobType}>
                      {getJobTypeText(jobType)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedLocation || selectedJobType) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedLocation && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Location: {selectedLocation}
                    <button
                      onClick={() => setSelectedLocation('')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedJobType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Type: {getJobTypeText(selectedJobType)}
                    <button
                      onClick={() => setSelectedJobType('')}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLocation('');
                    setSelectedJobType('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-primary/10">
              {jobs.length === 0 ? (
                <>
                  <p className="text-foreground/70 text-lg">No jobs available right now</p>
                  <p className="text-foreground/50 mt-2">Check back soon for new opportunities</p>
                </>
              ) : (
                <>
                  <p className="text-foreground/70 text-lg">No jobs match your filters</p>
                  <p className="text-foreground/50 mt-2">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedLocation('');
                      setSelectedJobType('');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => {
                const hasApplied = job.applications && job.applications.length > 0;

                return (
                  <div key={job.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-primary/5 hover:border-primary/20">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
                      <span className="bg-accent/10 text-accent-dark text-xs px-2 py-1 rounded-full font-medium">
                        {getJobTypeText(job.job_type)}
                      </span>
                    </div>
                    
                    <p className="text-primary font-semibold mb-1">{job.companies?.name || 'Company'}</p>
                    <p className="text-foreground/50 text-sm mb-3 flex items-center gap-1">
                      📍 {job.location}
                    </p>

                    <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                      {job.description.substring(0, 100)}...
                    </p>

                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-bold text-lg">{job.pay}</span>
                        <span className="text-foreground/50 text-xs">
                          👥 {job.workers_needed} needed
                        </span>
                      </div>

                      <div className="text-foreground/60 text-sm">
                        {getShiftTimingText(job.shift_timing)}
                      </div>
                    </div>

                    {user && profile?.role === 'worker' ? (
                      hasApplied ? (
                        <div className="w-full bg-green-50 border border-green-200 text-green-700 py-2.5 px-4 rounded-xl text-center font-medium">
                          ✓ Applied ({job.applications![0].status})
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={applying === job.id}
                          className="w-full bg-primary text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-60"
                        >
                          {applying === job.id ? 'Applying...' : 'Apply now'}
                        </button>
                      )
                    ) : user ? (
                      <div className="w-full bg-gray-100 text-foreground/60 py-2.5 px-4 rounded-xl text-center text-sm">
                        Only workers can apply
                      </div>
                    ) : (
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full bg-primary text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark transition-all font-medium shadow-sm hover:shadow-md"
                      >
                        Login to apply
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