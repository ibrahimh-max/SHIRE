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
        <div className="py-8 px-4 max-w-md mx-auto space-y-6">
          <div className="skeleton h-24 w-full mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-32 w-full"></div>
          </div>
          <div className="skeleton h-40 w-full"></div>
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

          {/* App-like header */}
          <div className="mb-8 animate-fade-in-up">
            <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider mb-1">
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </p>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {profile?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            {profile?.role === 'worker' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-wide">
                  {profile.preferred_role || 'Hospitality Talent'}
                </span>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${profile.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile.is_available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  {profile.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            )}
            {profile?.role === 'employer' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-wide">
                  Hospitality Employer
                </span>
              </div>
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
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              
              {/* Profile Completion */}
              <div className="card-surface p-6">
                {(() => {
                  const requiredFields = ['phone', 'age', 'preferred_role', 'availability', 'hospitality_experience', 'start_availability'];
                  const missingFields = requiredFields.filter(field => !profile[field as keyof typeof profile]);
                  const isComplete = missingFields.length === 0;
                  const pct = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);

                  return (
                    <div className="flex items-center gap-6">
                      {/* Radial Progress */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-100"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={`${isComplete ? 'text-success' : 'text-primary'}`}
                            strokeDasharray={`${pct}, 100`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                          {pct}%
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground mb-1">
                          {isComplete ? 'Profile Complete!' : 'Complete your profile'}
                        </h3>
                        <p className="text-sm text-foreground/60 mb-3">
                          {isComplete ? 'Employers can now discover you.' : 'Add your details to get hired faster.'}
                        </p>
                        {!isComplete && (
                          <Link href="/app/profile" className="text-primary font-bold text-sm flex items-center gap-1 hover:text-primary-dark">
                            Complete now
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Interview Inbox Section */}
              <div>
                <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-wider ml-1 mb-3">Interview Inbox</h3>

                {interviewsLoading ? (
                  <div className="space-y-3">
                    <div className="skeleton h-32 w-full"></div>
                    <div className="skeleton h-32 w-full"></div>
                  </div>
                ) : interviewInvitations.length === 0 ? (
                  <div className="card-surface p-8 text-center border-dashed border-2 border-gray-200 shadow-none">
                    <div className="text-4xl mb-4 opacity-50">📫</div>
                    <h3 className="text-lg font-bold text-foreground mb-2">No interviews yet</h3>
                    <p className="text-foreground/60 text-sm">
                      When employers want to interview you, their requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviewInvitations.map((invitation) => (
                      <div key={invitation.id} className="card-surface p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {invitation.company_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-foreground truncate pr-2">
                                {invitation.company_name}
                              </h3>
                              <span className="text-xs text-foreground/40 whitespace-nowrap">
                                {new Date(invitation.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                              {invitation.message}
                            </p>
                            
                            {invitation.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateInterviewStatus(invitation.id, 'interested')}
                                  disabled={updatingInterviewId === invitation.id}
                                  className="flex-1 bg-success text-white py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                  Interested
                                </button>
                                <button
                                  onClick={() => updateInterviewStatus(invitation.id, 'not_interested')}
                                  disabled={updatingInterviewId === invitation.id}
                                  className="flex-1 bg-gray-100 text-foreground py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${invitation.status === 'interested' ? 'bg-success' : 'bg-danger'}`}></span>
                                <span className="text-xs font-bold text-foreground/60 uppercase tracking-wide">
                                  {invitation.status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMPLOYER DASHBOARD */}
          {profile?.role === 'employer' && (
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {candidatesLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="skeleton h-32 w-full"></div>
                  <div className="skeleton h-32 w-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-surface p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-4">
                      👥
                    </div>
                    <p className="text-3xl font-black text-foreground mb-1">{totalCandidates}</p>
                    <p className="text-sm font-medium text-foreground/60">Available Talent</p>
                  </div>
                  
                  <div className="card-surface p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-success/10 to-transparent rounded-bl-full"></div>
                    <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center text-xl mb-4">
                      ✨
                    </div>
                    <p className="text-3xl font-black text-foreground mb-1">-</p>
                    <p className="text-sm font-medium text-foreground/60">Interested</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-wider ml-1">Quick Actions</h3>
                
                <Link href="/app/candidates" className="card-surface p-5 flex items-center justify-between group hover:border-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                      🔍
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Browse Talent</h4>
                      <p className="text-sm text-foreground/60">Find staff for your business</p>
                    </div>
                  </div>
                  <div className="text-gray-300 group-hover:text-primary transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </div>
                </Link>

                <Link href="/app/requests" className="card-surface p-5 flex items-center justify-between group hover:border-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                      📨
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">View Requests</h4>
                      <p className="text-sm text-foreground/60">Manage interview invitations</p>
                    </div>
                  </div>
                  <div className="text-gray-300 group-hover:text-primary transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </div>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}