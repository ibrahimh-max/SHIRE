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

  useEffect(() => {
    console.log('REQUESTS MOUNT');
    return () => console.log('REQUESTS UNMOUNT');
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

    // Both worker and employer can access this page
  }, [user?.id, profile?.role, loading, authInitialized, router]);

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
    console.log('REQUESTS FETCH START');
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
      console.log('REQUESTS FETCH END');
      setPageLoading(false);
    }
  };

  // Fetch interview invitations received by worker
  const fetchWorkerInvitations = async () => {
    console.log('REQUESTS FETCH START');
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
      console.log('REQUESTS FETCH END');
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
        <div className="py-8 px-4 max-w-md mx-auto space-y-6">
          <div className="skeleton h-20 w-full mb-6"></div>
          <div className="space-y-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-32 w-full"></div>
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

          {/* App-like header */}
          <div className="mb-6 animate-fade-in-up">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">
                  {profile?.role === 'employer' ? 'Sent Requests' : 'Inbox'}
                </h1>
                <p className="text-foreground/60 mt-1 font-medium">
                  {profile?.role === 'employer'
                    ? `${requests.length} total invitations`
                    : `${workerInvitations.length} total invitations`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">
                📨
              </div>
            </div>
          </div>

          {/* Stats Header (Tab-like) */}
          {!pageLoading && (profile?.role === 'employer' ? requests.length > 0 : workerInvitations.length > 0) && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 animate-fade-in-up hide-scrollbar" style={{ animationDelay: '0.1s' }}>
              <div className="card-surface px-4 py-3 flex items-center gap-3 flex-shrink-0 min-w-[120px]">
                <div className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center font-bold">
                  {(profile?.role === 'employer' ? requests : workerInvitations).filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm font-bold text-foreground">Pending</div>
              </div>
              <div className="card-surface px-4 py-3 flex items-center gap-3 flex-shrink-0 min-w-[120px]">
                <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center font-bold">
                  {(profile?.role === 'employer' ? requests : workerInvitations).filter(r => r.status === 'interested').length}
                </div>
                <div className="text-sm font-bold text-foreground">Accepted</div>
              </div>
              <div className="card-surface px-4 py-3 flex items-center gap-3 flex-shrink-0 min-w-[120px]">
                <div className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center font-bold">
                  {(profile?.role === 'employer' ? requests : workerInvitations).filter(r => r.status === 'not_interested').length}
                </div>
                <div className="text-sm font-bold text-foreground">Declined</div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* EMPLOYER VIEW */}
          {profile?.role === 'employer' && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {pageLoading ? (
                <div className="space-y-4">
                  <div className="skeleton h-32 w-full"></div>
                  <div className="skeleton h-32 w-full"></div>
                  <div className="skeleton h-32 w-full"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="card-surface p-10 text-center border-dashed border-2 border-gray-200 shadow-none mt-8">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl opacity-50">📭</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No Requests Sent</h3>
                  <p className="text-foreground/60 max-w-[200px] mx-auto">
                    When you invite talent to interview, the requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="card-surface p-5 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                          {request.worker_name ? request.worker_name.charAt(0).toUpperCase() : '?'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-foreground truncate pr-2 text-lg">
                              {request.worker_name || 'Unknown'}
                            </h3>
                            <span className="text-xs font-medium text-foreground/40 whitespace-nowrap pt-1">
                              {new Date(request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          
                          {request.worker_preferred_role && (
                            <p className="text-sm font-bold text-primary mb-2">
                              {request.worker_preferred_role}
                            </p>
                          )}
                          
                          {request.message && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
                              <p className="text-sm text-foreground/70 italic line-clamp-2">
                                "{request.message}"
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                              request.status === 'pending'
                                ? 'bg-warning/10 text-warning'
                                : request.status === 'interested'
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                request.status === 'pending' ? 'bg-warning animate-pulse' :
                                request.status === 'interested' ? 'bg-success' : 'bg-danger'
                              }`}></span>
                              {request.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WORKER VIEW */}
          {profile?.role === 'worker' && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {successMsg && (
                <div className="mb-6 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 font-medium">
                  {successMsg}
                </div>
              )}

              {pageLoading ? (
                <div className="space-y-4">
                  <div className="skeleton h-48 w-full"></div>
                  <div className="skeleton h-48 w-full"></div>
                </div>
              ) : workerInvitations.length === 0 ? (
                <div className="card-surface p-10 text-center border-dashed border-2 border-gray-200 shadow-none mt-8">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl opacity-50">📬</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No Interview Requests Yet</h3>
                  <p className="text-foreground/60 max-w-[200px] mx-auto">
                    Employers will be able to invite you here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workerInvitations.map((invitation) => (
                    <div key={invitation.id} className="card-surface p-5 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Company Logo Initials */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                          {invitation.company_name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-foreground text-lg truncate pr-2">
                              {invitation.company_name}
                            </h3>
                            <span className="text-xs font-medium text-foreground/40 whitespace-nowrap pt-1">
                              {new Date(invitation.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          {/* Message Bubble */}
                          <div className="relative bg-gray-50 rounded-2xl rounded-tl-sm p-4 mt-3 mb-4 border border-gray-100">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {invitation.message}
                            </p>
                          </div>

                          {/* Status / Actions */}
                          {invitation.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateInterviewStatus(invitation.id, 'interested')}
                                disabled={updatingId === invitation.id}
                                className="flex-1 bg-success text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {updatingId === invitation.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Accept
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => updateInterviewStatus(invitation.id, 'not_interested')}
                                disabled={updatingId === invitation.id}
                                className="flex-1 bg-gray-100 text-foreground py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {updatingId === invitation.id ? (
                                  <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    Decline
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                              invitation.status === 'interested' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                invitation.status === 'interested' ? 'bg-success' : 'bg-danger'
                              }`}></span>
                              {invitation.status === 'interested' ? 'Accepted' : 'Declined'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}