'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { InterviewInvitation } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface InterviewRequestWithWorker extends InterviewInvitation {
  worker_name?: string;
  worker_preferred_role?: string;
  worker_location?: string;
}

export default function RequestsPage() {
  const { user, profile, loading, authInitialized } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<InterviewRequestWithWorker[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle authentication redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (profile && profile.role !== 'employer') {
      router.push('/dashboard');
      return;
    }
  }, [user, profile, loading, authInitialized, router]);

  // Fetch interview requests
  useEffect(() => {
    if (!user || !profile || profile.role !== 'employer') return;
    fetchRequests();
  }, [user, profile]);

  const fetchRequests = async () => {
    setPageLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('interview_invitations')
        .select(`
          *,
          profiles!interview_invitations_worker_id_fkey (
            name,
            preferred_role,
            location
          )
        `)
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      // Transform data to include worker details
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        worker_name: item.profiles?.name,
        worker_preferred_role: item.profiles?.preferred_role,
        worker_location: item.profiles?.location,
      }));

      setRequests(transformedData);
    } catch (err) {
      setError('Failed to fetch interview requests');
    } finally {
      setPageLoading(false);
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

  if (!user || (profile && profile.role !== 'employer')) {
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

        </div>
      </div>
    </div>
  );
}
