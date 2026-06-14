'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { InterviewInvitation } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { user, profile, loading, authInitialized } = useAuth();
  const router = useRouter();

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [interviewInvitations, setInterviewInvitations] = useState<InterviewInvitation[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [updatingInterviewId, setUpdatingInterviewId] = useState<string | null>(null);
  const [interviewSuccess, setInterviewSuccess] = useState('');
  const [interviewError, setInterviewError] = useState('');

  useEffect(() => {
    console.log('DASHBOARD MOUNT');
    return () => console.log('DASHBOARD UNMOUNT');
  }, []);
  


  // Handle authentication redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/app/login');
      return;
    }

    // Check if worker has required profile fields
    if (profile && profile.role === 'worker') {
      const requiredFields = ['phone', 'age', 'preferred_role', 'availability', 'hospitality_experience', 'start_availability'];
      const missingFields = requiredFields.filter(field => !profile[field as keyof typeof profile]);

      if (missingFields.length > 0) {
        router.push('/app/profile');
        return;
      }
    }
  }, [user?.id, profile?.role, loading, authInitialized, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user || !profile) return;

    if (profile.role === 'employer') {
      fetchEmployerData();
    } else if (profile.role === 'worker') {
      fetchInterviewInvitations();
    }
  }, [user?.id, profile?.role]);

  // Fetch employer data in parallel
  const fetchEmployerData = async () => {
    if (!user) return;
    console.log('DASHBOARD FETCH START');
    setCandidatesLoading(true);
    setError('');

    try {
      const [companyRes, candidatesRes] = await Promise.all([
        supabase.from('companies').select('id').eq('owner_id', user.id).maybeSingle(),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'worker').eq('is_available', true)
      ]);

      if (companyRes.error) {
        setError('Failed to load company data: ' + companyRes.error.message);
        return;
      }

      if (!companyRes.data) {
        router.push('/app/create-company');
        return;
      }

      if (candidatesRes.error) {
        setError(candidatesRes.error.message);
      } else {
        setTotalCandidates(candidatesRes.count || 0);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      console.log('DASHBOARD FETCH END');
      setCandidatesLoading(false);
    }
  };

  // Fetch interview invitations for worker
  const fetchInterviewInvitations = async () => {
    console.log('DASHBOARD FETCH START');
    setInterviewsLoading(true);
    setInterviewError('');

    try {
      const { data, error } = await supabase
        .from('interview_invitations')
        .select('*')
        .eq('worker_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        setInterviewError(error.message);
        return;
      }

      setInterviewInvitations(data || []);
    } catch (err) {
      setInterviewError('Failed to fetch interview requests');
    } finally {
      console.log('DASHBOARD FETCH END');
      setInterviewsLoading(false);
    }
  };

  // Update interview status
  const updateInterviewStatus = async (invitationId: string, newStatus: 'interested' | 'not_interested') => {
    setUpdatingInterviewId(invitationId);
    setInterviewError('');
    setInterviewSuccess('');

    try {
      const { error } = await supabase
        .from('interview_invitations')
        .update({ status: newStatus })
        .eq('id', invitationId);

      if (error) {
        setInterviewError('Failed to update status');
        return;
      }

      setInterviewSuccess('Status updated successfully');
      await fetchInterviewInvitations();

      setTimeout(() => {
        setInterviewSuccess('');
      }, 3000);
    } catch (err) {
      setInterviewError('Failed to update status');
    } finally {
      setUpdatingInterviewId(null);
    }
  };

  // Initial auth loading (non-blocking UI)
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-pulse bg-primary/20 h-12 w-48 rounded-xl mx-auto"></div>
            <div className="animate-pulse bg-primary/10 h-8 w-32 rounded-xl mx-auto"></div>
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
      <div className="py-8 px-4">
        {/* CHANGE 1: Mobile-first container */}
        <div className="max-w-md mx-auto">

          {/* CHANGE 2: App-like header */}
          <div className="mb-6">
            <p className="text-sm text-foreground/50">
              Welcome Back
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              {profile?.name || 'User'} 👋
            </h1>
            {profile?.role === 'worker' && (
              <p className="text-primary mt-2 font-medium">
                {profile.preferred_role || 'Hospitality Talent'} •{' '}
                {profile.is_available ? 'Available' : 'Not Available'}
              </p>
            )}
            {profile?.role === 'employer' && (
              <p className="text-primary mt-2 font-medium">
                Hospitality Employer
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Interview Success/Error Messages */}
          {interviewSuccess && (
            <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700">
              {interviewSuccess}
            </div>
          )}
          {interviewError && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {interviewError}
            </div>
          )}

          {/* Missing profile */}
          {user && !profile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Profile not found
              </h2>
              <p className="text-foreground/60 mb-4">
                Your account exists but profile data is missing.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Refresh
              </button>
            </div>
          )}

          {/* WORKER DASHBOARD */}
          {profile?.role === 'worker' && (
            <div className="space-y-6">
              {/* CHANGE 3: Interview Requests moved ABOVE Profile Status */}
              {/* Interview Inbox Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
                {/* CHANGE 6: Updated title */}
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Interview Inbox
                </h2>

                {interviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading interview requests...</p>
                  </div>
                ) : interviewInvitations.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Waiting For Opportunities</h3>
                    <p className="text-foreground/60">
                      Interview invitations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviewInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="border border-primary/10 rounded-xl p-5 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground mb-1">
                              {invitation.company_name}
                            </h3>
                            <p className="text-sm text-foreground/60 mb-3">
                              {invitation.message}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                invitation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : invitation.status === 'interested'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                              </span>
                              <span className="text-foreground/40">
                                {new Date(invitation.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {invitation.status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => updateInterviewStatus(invitation.id, 'interested')}
                                disabled={updatingInterviewId === invitation.id}
                                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingInterviewId === invitation.id ? (
                                  <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    Updating...
                                  </span>
                                ) : (
                                  'Interested'
                                )}
                              </button>
                              <button
                                onClick={() => updateInterviewStatus(invitation.id, 'not_interested')}
                                disabled={updatingInterviewId === invitation.id}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingInterviewId === invitation.id ? (
                                  <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    Updating...
                                  </span>
                                ) : (
                                  'Not Interested'
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CHANGE 5: Updated title */}
              <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Your Hospitality Profile
                </h2>

                {(() => {
                  const requiredFields = ['phone', 'age', 'preferred_role', 'availability', 'hospitality_experience', 'start_availability'];
                  const missingFields = requiredFields.filter(field => !profile[field as keyof typeof profile]);
                  const isComplete = missingFields.length === 0;
                  const completionPercentage = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);

                  return (
                    <>
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-foreground/70">
                            Profile Completion
                          </span>
                          <span className={`text-sm font-semibold ${
                            isComplete ? 'text-green-600' : 'text-foreground/60'
                          }`}>
                            {completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-foreground/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete ? 'bg-green-500' : 'bg-primary'
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Availability</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              profile.is_available ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span className="font-medium text-foreground text-sm">
                              {profile.is_available ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Role</p>
                          <p className="font-medium text-foreground text-sm">
                            {profile.preferred_role || 'Not set'}
                          </p>
                        </div>

                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Experience</p>
                          <p className="font-medium text-foreground text-sm">
                            {profile.hospitality_experience || 'Not set'}
                          </p>
                        </div>

                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Can Start</p>
                          <p className="font-medium text-foreground text-sm">
                            {profile.start_availability || 'Not set'}
                          </p>
                        </div>
                      </div>

                      {!isComplete && (
                        <Link
                          href="/app/profile"
                          className="inline-block w-full text-center bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-sm font-medium"
                        >
                          Complete Profile
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* EMPLOYER DASHBOARD */}
          {profile?.role === 'employer' && (
            <div className="space-y-6">
              {/* CHANGE 4: New employer dashboard design */}
              <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
                {candidatesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-4">👥</div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Start Building Your Team</h3>
                      <p className="text-foreground/60">
                        Browse talent and send invitations.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-primary/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-primary">
                          {totalCandidates}
                        </p>
                        <p className="text-sm text-foreground/60">
                          Talent
                        </p>
                      </div>
                      <div className="bg-primary/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-primary">
                          -
                        </p>
                        <p className="text-sm text-foreground/60">
                          Interested
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/app/candidates"
                      className="block w-full text-center bg-primary text-white py-4 rounded-xl font-medium"
                    >
                      Browse Talent
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}