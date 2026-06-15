'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Candidate {
  id: string;
  name: string;
  age?: number;
  location?: string;
  experience?: string;
  availability?: 'Full Time' | 'Part Time' | 'Both';
  preferred_role?: 'Waiter' | 'Chef' | 'Kitchen Helper' | 'Receptionist' | 'Housekeeping' | 'Barista' | 'Delivery Staff';
  photo_url?: string;
  resume_url?: string;
  is_available?: boolean;
}

export default function CandidatesPage() {
  const { user, profile, loading, authInitialized } = useAuth();
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Add State
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('CANDIDATES MOUNT');
    return () => console.log('CANDIDATES UNMOUNT');
  }, []);

  // Filters
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [preferredRoleFilter, setPreferredRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  // Handle authentication redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/app/login');
      return;
    }

    if (profile && profile.role !== 'employer') {
      router.push('/app/dashboard');
      return;
    }
  }, [user?.id, profile?.role, loading, authInitialized, router]);

  // Fetch candidates — use primitives to avoid re-fetch on every profile object refresh
  useEffect(() => {
    if (!user?.id || profile?.role !== 'employer') return;
    fetchCandidates();
  }, [user?.id, profile?.role]);

  // Apply filters
  useEffect(() => {
    let filtered = candidates;

    if (locationFilter) {
      filtered = filtered.filter(c => 
        c.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (experienceFilter) {
      filtered = filtered.filter(c => 
        c.experience === experienceFilter
      );
    }

    if (preferredRoleFilter) {
      filtered = filtered.filter(c => 
        c.preferred_role === preferredRoleFilter
      );
    }

    if (availabilityFilter) {
      filtered = filtered.filter(c => 
        c.availability === availabilityFilter
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, locationFilter, experienceFilter, preferredRoleFilter, availabilityFilter]);

  // Add Function
  const sendInterviewRequest = async (workerId: string) => {
    if (!user || !profile) return;

    try {
      setSendingRequest(workerId);

      // 1. Fetch Employer Company
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('owner_id', user.id)
        .maybeSingle();

      const { data: existing } = await supabase
        .from('interview_invitations')
        .select('id')
        .eq('worker_id', workerId)
        .eq('employer_id', user.id)
        .maybeSingle();

      if (existing) {
        setError('You have already requested this candidate.');
        return;
      }

      // 2. Update Insert with company_name
      const { error } = await supabase
        .from('interview_invitations')
        .insert({
          worker_id: workerId,
          employer_id: user.id,
          employer_name: profile.name,
          company_name: company?.name || 'Unknown Company',
          status: 'pending',
          message: 'Interested in discussing an opportunity.'
        });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccessMessage('Interview request sent successfully.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch {
      setError('Failed to send interview request.');
    } finally {
      setSendingRequest(null);
    }
  };

  const fetchCandidates = async () => {
    console.log('CANDIDATES FETCH START');
    setPageLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setCandidates(data || []);
      setFilteredCandidates(data || []);
    } catch (err) {
      setError('Failed to fetch candidates');
    } finally {
      console.log('CANDIDATES FETCH END');
      setPageLoading(false);
    }
  };

  const clearFilters = () => {
    setLocationFilter('');
    setExperienceFilter('');
    setPreferredRoleFilter('');
    setAvailabilityFilter('');
  };

  // Initial auth loading
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="py-8 px-4 max-w-md mx-auto space-y-6">
          <div className="skeleton h-20 w-full"></div>
          <div className="skeleton h-12 w-full"></div>
          <div className="space-y-4">
            <div className="skeleton h-48 w-full"></div>
            <div className="skeleton h-48 w-full"></div>
            <div className="skeleton h-48 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'employer')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-4">
        {/* CHANGE 1: Mobile-first container */}
        <div className="max-w-md mx-auto">

          {/* App-like header */}
          <div className="mb-6 animate-fade-in-up">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">
                  Find Talent
                </h1>
                <p className="text-foreground/60 mt-1 font-medium">
                  {filteredCandidates.length} profiles available
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">
                🔍
              </div>
            </div>
          </div>

          {/* Error & Success Banners */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 font-medium">
              {successMessage}
            </div>
          )}

          {/* Collapsible Filters */}
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full card-surface p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 font-bold text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filters
                {(locationFilter || experienceFilter || preferredRoleFilter || availabilityFilter) && (
                  <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>
                )}
              </div>
              <div className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </button>

            {showFilters && (
              <div className="card-surface p-5 mt-2 space-y-4 animate-fade-in-up">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-foreground/50 uppercase tracking-wider">Refine Search</h3>
                  <button onClick={clearFilters} className="text-sm font-bold text-primary hover:text-primary-dark">
                    Clear all
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Location</label>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="E.g., Downtown..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Experience</label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="input-field bg-white"
                  >
                    <option value="">All levels</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-1.5">Role</label>
                  <select
                    value={preferredRoleFilter}
                    onChange={(e) => setPreferredRoleFilter(e.target.value)}
                    className="input-field bg-white"
                  >
                    <option value="">All roles</option>
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
                  <label className="block text-sm font-bold text-foreground mb-1.5">Availability</label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="input-field bg-white"
                  >
                    <option value="">All availability</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Talent List */}
          {pageLoading ? (
            <div className="space-y-4">
              <div className="skeleton h-48 w-full"></div>
              <div className="skeleton h-48 w-full"></div>
              <div className="skeleton h-48 w-full"></div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="card-surface p-10 text-center animate-fade-in-up border-dashed border-2 border-gray-200 shadow-none mt-8">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl opacity-50">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Talent Found</h3>
              <p className="text-foreground/60 mb-6 max-w-[200px] mx-auto">
                Try adjusting your filters to see more results.
              </p>
              {candidates.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="card-surface overflow-hidden flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="relative">
                        {candidate.photo_url ? (
                          <img
                            src={candidate.photo_url}
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-primary/20 p-0.5"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xl shadow-sm ring-2 ring-primary/20 p-0.5">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3.5 h-3.5 bg-success rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                          <h3 className="font-black text-lg text-foreground truncate">
                            {candidate.name}
                          </h3>
                          {candidate.preferred_role && (
                            <span className="text-sm font-bold text-primary truncate">
                              • {candidate.preferred_role}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {candidate.location && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-foreground/70">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              {candidate.location}
                            </span>
                          )}
                          {candidate.experience && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-foreground/70">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                              {candidate.experience}
                            </span>
                          )}
                          {candidate.availability && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                              {candidate.availability}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-5 pb-5 mt-auto">
                    <button
                      onClick={() => sendInterviewRequest(candidate.id)}
                      disabled={sendingRequest === candidate.id}
                      className="btn-primary"
                    >
                      {sendingRequest === candidate.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Invite to Interview
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}