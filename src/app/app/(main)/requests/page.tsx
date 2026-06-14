'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { InterviewInvitation } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Worker invitation type (received by worker)
interface WorkerInvitation extends InterviewInvitation {
  // uses fields already on InterviewInvitation
}

interface InterviewRequestWithWorker extends InterviewInvitation {
  worker_name?: string;
  worker_preferred_role?: string;
  worker_location?: string;
}

export default function RequestsPage() {
  const { user, profile, loading, authInitialized } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<InterviewRequestWithWorker[]>([]);
  const [workerInvitations, setWorkerInvitations] = useState<WorkerInvitation[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');



  // Handle authentication redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/app/login');
      return;
    }

    // Both worker and employer can access this page
  }, [user, profile, loading, authInitialized, router]);

  // Fetch interview requests
  useEffect(() => {
    if (!user || !profile) return;

    if (profile.role === 'employer') {
      fetchRequests();
    } else if (profile.role === 'worker') {
      fetchWorkerInvitations();
    }
  }, [user?.id, profile?.role]);

  const fetchRequests = async () => {
    setPageLoading(true);
    setError('');

    try {
      // Step 1: Fetch interview_invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('interview_invitations')
        .select('*')
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false });

      if (invitationsError) {
        setError(invitationsError.message);
        return;
      }

      if (!invitations || invitations.length === 0) {
        setRequests([]);
        return;
      }

      // Step 2: Extract worker_ids
      const workerIds = invitations.map(inv => inv.worker_id);

      // Step 3: Query profiles table separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, preferred_role, location')
        .in('id', workerIds);

      if (profilesError) {
        setError(profilesError.message);
        return;
      }

      // Step 4: Merge data client-side
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const transformedData = invitations.map(invitation => ({
        ...invitation,
        worker_name: profilesMap.get(invitation.worker_id)?.name,
        worker_preferred_role: profilesMap.get(invitation.worker_id)?.preferred_role,
        worker_location: profilesMap.get(invitation.worker_id)?.location,
      }));

      setRequests(transformedData);
    } catch (err) {
      setError('Failed to fetch interview requests');
    } finally {
      setPageLoading(false);
    }
  };

  // Fetch interview invitations received by worker
  const fetchWorkerInvitations = async () => {
    setPageLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('interview_invitations')
        .select('*')
        .eq('worker_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setWorkerInvitations(data || []);
    } catch (err) {
      setError('Failed to fetch interview requests');
    } finally {
      setPageLoading(false);
    }
  };

  // Update interview status (worker responding)
  const updateInterviewStatus = async (invitationId: string, newStatus: 'interested' | 'not_interested') => {
    setUpdatingId(invitationId);
    setError('');
    setSuccessMsg('');

    try {
      const { error: updateError } = await supabase
        .from('interview_invitations')
        .update({ status: newStatus })
        .eq('id', invitationId);

      if (updateError) {
        setError('Failed to update status');
        return;
      }

      setSuccessMsg('Status updated successfully');
      await fetchWorkerInvitations();

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdatingId(null);
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
              {profile?.role === 'employer'
                ? 'Interview Management'
                : 'Interview Inbox'}
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              {profile?.role === 'employer'
                ? 'Sent Requests'
                : 'Interview Requests'}
            </h1>
            <p className="text-primary mt-2 font-medium">
              {profile?.role === 'employer'
                ? `${requests.length} requests sent`
                : `${workerInvitations.length} requests received`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* CHANGE 3: Wrap employer section */}
          {profile?.role === 'employer' && (
            <>
              {pageLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-foreground/60">Loading interview requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-12 text-center">
                  <div className="text-4xl mb-4">📨</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No Requests Sent Yet</h3>
                  <p className="text-foreground/60">
                    Interview invitations you send will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      // CHANGE 4: Removed hover effects, reduced padding
                      className="bg-white rounded-2xl border border-primary/10 p-5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* Company Name - CHANGE 5: Better typography */}
                          <h3 className="font-bold text-base text-foreground mb-1">
                            🏢 {request.company_name}
                          </h3>

                          {/* Worker Details */}
                          <div className="space-y-2 mt-4">
                            {/* Worker Name */}
                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                              <span>👤</span>
                              <span>{request.worker_name || 'Unknown'}</span>
                            </div>

                            {/* Worker Preferred Role */}
                            {request.worker_preferred_role && (
                              <div className="flex items-center gap-2 text-sm text-foreground/70">
                                <span>👨‍🍳</span>
                                <span>{request.worker_preferred_role}</span>
                              </div>
                            )}

                            {/* Worker Location */}
                            {request.worker_location && (
                              <div className="flex items-center gap-2 text-sm text-foreground/70">
                                <span>📍</span>
                                <span>{request.worker_location}</span>
                              </div>
                            )}

                            {/* Message */}
                            {request.message && (
                              <div className="flex items-start gap-2 text-sm text-foreground/60 mt-3 pt-3 border-t border-primary/10">
                                <span>💬</span>
                                <span>{request.message}</span>
                              </div>
                            )}
                          </div>

                          {/* Status and Date */}
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-primary/10">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : request.status === 'interested'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                            <span className="text-sm text-foreground/40">
                              Sent: {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* WORKER VIEW */}
          {profile?.role === 'worker' && (
            <>
              {successMsg && (
                <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700">
                  {successMsg}
                </div>
              )}

              {pageLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-foreground/60">Loading interview requests...</p>
                </div>
              ) : workerInvitations.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-12 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No Interview Requests Yet</h3>
                  <p className="text-foreground/60">
                    Employers will be able to invite you here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workerInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      // CHANGE 6: Removed hover effects, reduced padding
                      className="bg-white rounded-2xl border border-primary/10 p-5"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* CHANGE 10: Add company icon */}
                          <h3 className="font-bold text-base text-foreground mb-1">
                            🏢 {invitation.company_name}
                          </h3>
                          
                          {/* CHANGE 7: Premium message styling */}
                          <div className="bg-primary/5 rounded-xl p-3 mt-3 mb-3">
                            <p className="text-sm text-foreground/70">
                              {invitation.message}
                            </p>
                          </div>
                          
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
                          // CHANGE 8: Vertical button stack
                          <div className="flex flex-col gap-2 mt-4">
                            {/* CHANGE 9: Updated button text */}
                            <button
                              onClick={() => updateInterviewStatus(invitation.id, 'interested')}
                              disabled={updatingId === invitation.id}
                              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingId === invitation.id ? (
                                <span className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Updating...
                                </span>
                              ) : (
                                'Accept Interview'
                              )}
                            </button>
                            <button
                              onClick={() => updateInterviewStatus(invitation.id, 'not_interested')}
                              disabled={updatingId === invitation.id}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingId === invitation.id ? (
                                <span className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Updating...
                                </span>
                              ) : (
                                'Decline'
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}