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
  }, [user, profile, loading, authInitialized, router]);

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
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60">Loading your account...</p>
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

          {/* CHANGE 2: App-like header */}
          <div className="mb-6">
            <p className="text-sm text-foreground/50">
              Available Talent
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Find Hospitality Talent
            </h1>
            <p className="text-primary mt-2 font-medium">
              {filteredCandidates.length} talent profiles available
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Add Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700">
              {successMessage}
            </div>
          )}

          {/* CHANGE 3 & 4: Smaller filter section with vertical stack */}
          <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-foreground text-sm">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Enter location..."
                  className="w-full px-4 py-2 rounded-xl border border-primary/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Experience
                </label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-primary/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm"
                >
                  <option value="">All experience levels</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>

              {/* Preferred Role Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Preferred Role
                </label>
                <select
                  value={preferredRoleFilter}
                  onChange={(e) => setPreferredRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-primary/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm"
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

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">
                  Availability
                </label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-primary/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white text-sm"
                >
                  <option value="">All availability</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>
          </div>

          {/* CHANGE 6: Vertical stack for candidates */}
          {pageLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground/60">Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-foreground mb-2">No Talent Found</h3>
              <p className="text-foreground/60 mb-4">
                Try adjusting your filters.
              </p>
              {candidates.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  // CHANGE 7: Removed hover effects
                  className="bg-white rounded-2xl border border-primary/10 overflow-hidden"
                >
                  {/* CHANGE 5: Smaller photo section */}
                  <div className="h-20 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {candidate.photo_url ? (
                      <img
                        src={candidate.photo_url}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center border-4 border-white shadow-sm">
                        <span className="text-2xl">
                          {candidate.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-4">
                    {/* CHANGE 8 & 9: Cleaner typography and role at top */}
                    <h3 className="font-bold text-base text-foreground">
                      {candidate.name}
                    </h3>
                    
                    {candidate.preferred_role && (
                      <p className="text-primary text-sm font-medium mt-1">
                        {candidate.preferred_role}
                      </p>
                    )}
                    
                    <div className="space-y-2 mt-3">
                      {/* Age */}
                      {candidate.age && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <span>🎂</span>
                          <span>{candidate.age} years old</span>
                        </div>
                      )}

                      {/* Location */}
                      {candidate.location && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <span>📍</span>
                          <span>{candidate.location}</span>
                        </div>
                      )}

                      {/* Experience */}
                      {candidate.experience && (
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <span>💼</span>
                          <span>{candidate.experience}</span>
                        </div>
                      )}

                      {/* Availability */}
                      {candidate.availability && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            candidate.availability === 'Full Time'
                              ? 'bg-primary/10 text-primary'
                              : candidate.availability === 'Part Time'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-primary/5 text-primary'
                          }`}>
                            {candidate.availability}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Available Badge & Request Interview Button */}
                    <div className="mt-4 pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          Available for hire
                        </span>
                      </div>

                      {/* CHANGE 10: Updated button text */}
                      <button
                        onClick={() => sendInterviewRequest(candidate.id)}
                        disabled={sendingRequest === candidate.id}
                        className="w-full mt-2 bg-primary text-white py-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {sendingRequest === candidate.id
                          ? 'Sending...'
                          : 'Invite To Interview'}
                      </button>
                    </div>
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