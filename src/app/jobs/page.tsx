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

const BRAND = '#6C63FF';
const BRAND_DARK = '#5a52e0';

const JOB_TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  'full-time':  { bg: '#EEEDFE', color: '#534AB7', label: 'Full-time' },
  'part-time':  { bg: '#E1F5EE', color: '#0F6E56', label: 'Part-time' },
  'contract':   { bg: '#FAEEDA', color: '#854F0B', label: 'Contract' },
  'temporary':  { bg: '#FAECE7', color: '#993C1D', label: 'Temporary' },
};

const SHIFT_LABELS: Record<string, string> = {
  morning:   'Morning',
  afternoon: 'Afternoon',
  evening:   'Evening',
  night:     'Night',
  flexible:  'Flexible',
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:  { bg: '#FAEEDA', color: '#854F0B' },
  accepted: { bg: '#EAF3DE', color: '#3B6D11' },
  rejected: { bg: '#FCEBEB', color: '#A32D2D' },
};

export default function Jobs() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [uniqueJobTypes, setUniqueJobTypes] = useState<string[]>([]);

  useEffect(() => { fetchJobs(); }, []);

  useEffect(() => {
    let filtered = jobs;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(q) || j.companies?.name.toLowerCase().includes(q)
      );
    }
    if (selectedLocation) filtered = filtered.filter(j => j.location === selectedLocation);
    if (selectedJobType) filtered = filtered.filter(j => j.job_type === selectedJobType);
    setFilteredJobs(filtered);
  }, [searchTerm, selectedLocation, selectedJobType, jobs]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name), applications(id, status, user_id)')
        .order('created_at', { ascending: false });

      if (error) { setError(error.message); return; }

      let processed = data || [];
      if (user && profile?.role === 'worker') {
        processed = data?.map(job => ({
          ...job,
          applications: job.applications?.filter((app: any) => app.user_id === user.id) || [],
        })) || [];
      }

      setJobs(processed);
      setFilteredJobs(processed);
      setUniqueLocations([...new Set(processed.map(j => j.location).filter(Boolean))]);
      setUniqueJobTypes([...new Set(processed.map(j => j.job_type).filter(Boolean))]);
    } catch { setError('Failed to fetch jobs'); }
    finally { setLoading(false); }
  };

  const handleApply = async (jobId: string) => {
    if (!user || profile?.role !== 'worker') { setError('Only workers can apply for jobs'); return; }
    setApplying(jobId);
    try {
      const job = jobs.find(j => j.id === jobId);
      if (job?.applications && job.applications.length > 0) {
        setError('You have already applied for this job');
        setApplying(null);
        return;
      }
      const { error } = await supabase
        .from('applications')
        .insert({ job_id: jobId, user_id: user.id, status: 'pending' })
        .select().single();

      if (error) {
        setError(error.code === '23505' ? 'You have already applied for this job' : error.message);
        return;
      }
      await fetchJobs();
    } catch { setError('Failed to apply for job'); }
    finally { setApplying(null); }
  };

  const clearFilters = () => { setSearchTerm(''); setSelectedLocation(''); setSelectedJobType(''); };
  const hasFilters = searchTerm || selectedLocation || selectedJobType;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-200 rounded-full mx-auto mb-4" style={{ borderTopColor: BRAND, animation: 'spin 0.8s linear infinite' }} />
            <p className="text-sm text-gray-500">Loading jobs...</p>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find your next role</h1>
          <p className="text-gray-500">Hospitality jobs waiting for you</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search job title or company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50"
                style={{ '--tw-ring-color': BRAND } as any}
              />
            </div>

            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 text-gray-700"
            >
              <option value="">All locations</option>
              {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <select
              value={selectedJobType}
              onChange={e => setSelectedJobType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 text-gray-700"
            >
              <option value="">All types</option>
              {uniqueJobTypes.map(t => (
                <option key={t} value={t}>{JOB_TYPE_STYLES[t]?.label || t}</option>
              ))}
            </select>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  &ldquo;{searchTerm}&rdquo;
                  <button onClick={() => setSearchTerm('')} className="ml-1 text-gray-400 hover:text-gray-700">×</button>
                </span>
              )}
              {selectedLocation && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('')} className="ml-1 text-gray-400 hover:text-gray-700">×</button>
                </span>
              )}
              {selectedJobType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={JOB_TYPE_STYLES[selectedJobType] ? { background: JOB_TYPE_STYLES[selectedJobType].bg, color: JOB_TYPE_STYLES[selectedJobType].color } : { background: '#f3f4f6', color: '#374151' }}>
                  {JOB_TYPE_STYLES[selectedJobType]?.label || selectedJobType}
                  <button onClick={() => setSelectedJobType('')} className="ml-1 opacity-60 hover:opacity-100">×</button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredJobs.length > 0 && (
          <p className="text-sm text-gray-400 mb-4">{filteredJobs.length} {filteredJobs.length === 1 ? 'role' : 'roles'} found</p>
        )}

        {/* Empty state */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {jobs.length === 0 ? (
              <>
                <p className="text-gray-700 font-medium">No jobs available yet</p>
                <p className="text-gray-400 text-sm mt-1">Check back soon for new opportunities</p>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium">No jobs match your filters</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
                  style={{ background: BRAND }}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map(job => {
              const hasApplied = job.applications && job.applications.length > 0;
              const typeStyle = JOB_TYPE_STYLES[job.job_type] || { bg: '#f3f4f6', color: '#374151', label: job.job_type };
              const appStatus = hasApplied ? job.applications![0].status : null;
              const statusStyle = appStatus ? STATUS_STYLES[appStatus] : null;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col hover:border-gray-200 hover:shadow-md transition-all"
                >
                  {/* Top row — type badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                      {typeStyle.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-semibold text-gray-900 mb-1 leading-snug">{job.title}</h2>

                  {/* Company */}
                  <p className="text-sm font-medium mb-0.5" style={{ color: BRAND }}>{job.companies?.name || 'Company'}</p>

                  {/* Location — truncated */}
                  <p className="text-xs text-gray-400 mb-3 truncate" title={job.location}>
                    {job.location}
                  </p>

                  {/* Description preview */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                    {job.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{job.pay}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{SHIFT_LABELS[job.shift_timing] || job.shift_timing} shift</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      {job.workers_needed} {job.workers_needed === 1 ? 'opening' : 'openings'}
                    </span>
                  </div>

                  {/* CTA */}
                  {user && profile?.role === 'worker' ? (
                    hasApplied ? (
                      <div
                        className="w-full py-2.5 px-4 rounded-xl text-center text-sm font-medium"
                        style={{ background: statusStyle?.bg || '#f3f4f6', color: statusStyle?.color || '#374151' }}
                      >
                        Applied · {appStatus!.charAt(0).toUpperCase() + appStatus!.slice(1)}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applying === job.id}
                        className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
                        style={{ background: applying === job.id ? '#a8a4f0' : BRAND }}
                      >
                        {applying === job.id ? 'Applying...' : 'Apply now'}
                      </button>
                    )
                  ) : user ? (
                    <div className="w-full bg-gray-50 text-gray-400 py-2.5 px-4 rounded-xl text-center text-sm">
                      Only workers can apply
                    </div>
                  ) : (
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all"
                      style={{ background: BRAND }}
                      onMouseEnter={e => (e.currentTarget.style.background = BRAND_DARK)}
                      onMouseLeave={e => (e.currentTarget.style.background = BRAND)}
                    >
                      Log in to apply
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}