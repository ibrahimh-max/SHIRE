'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
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
  }, [user, profile]);

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

  // Initial auth loading
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/60">Loading your account...</p>
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
      <Navigation />

      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              My Interview Requests
            </h1>
            <p className="text-foreground/60 mt-2">
              Track all interview requests you have sent to candidates
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Requests List */}
          {pageLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground/60">Loading interview requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-12 text-center">
              <p className="text-foreground/60">
                No interview requests sent yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Company Name */}
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {request.company_name}
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
                  <p className="text-foreground/60">
                    No interview requests yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workerInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6 hover:shadow-md transition-shadow"
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
                              disabled={updatingId === invitation.id}
                              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingId === invitation.id ? (
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
                              disabled={updatingId === invitation.id}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updatingId === invitation.id ? (
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
            </>
          )}

        </div>
      </div>
    </div>
  );
}
