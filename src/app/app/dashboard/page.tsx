'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { InterviewInvitation } from '@/lib/supabase';

export const dynamic = 'force-dynamic';


interface EmployerJob {
  id: string;
  title: string;
  pay: string;
  location: string;
  job_type: string;
  created_at: string;
  companies: {
    name: string;
  };
  applications: {
    id: string;
    status: string;
    user_id: string;
    created_at: string;
    profiles: {
      id: string;
      name: string;
    };
  }[];
}

interface WorkerApplication {
  id: string;
  status: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    pay: string;
    location: string;
    job_type: string;
    companies: {
      name: string;
    };
  };
}

export default function Dashboard() {
  const { user, profile, loading, authInitialized } = useAuth();
  const router = useRouter();

  const [employerJobs, setEmployerJobs] = useState<EmployerJob[]>([]);
  const [workerApplications, setWorkerApplications] = useState<WorkerApplication[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [interviewInvitations, setInterviewInvitations] = useState<InterviewInvitation[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [updatingInterviewId, setUpdatingInterviewId] = useState<string | null>(null);
  const [interviewSuccess, setInterviewSuccess] = useState('');
  const [interviewError, setInterviewError] = useState('');

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
  }, [user, profile, loading, authInitialized, router]);

  // Step 2: Add function
const checkCompany = async () => {
  if (!user) return;

  const { data } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!data) {
    router.push('/app/create-company');
  }
};

  // Fetch dashboard data
  useEffect(() => {
    if (!user || !profile) return;

    // Step 3: Replace the employer data loading section
    if (profile.role === 'employer') {
      checkCompany();
      fetchTotalCandidates();
    }

    if (profile.role === 'worker') {
      fetchInterviewInvitations();
    }

    // OLD JOBS/APPLICATIONS FLOW - COMMENTED OUT
    // if (profile.role === 'employer') {
    //   fetchEmployerJobs();
    // }

    // if (profile.role === 'worker') {
    //   fetchWorkerApplications();
    // }
  }, [user, profile]);

  const fetchEmployerJobs = async () => {
    setDashboardLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(
            id,
            name,
            owner_id
          ),
          applications(
            id,
            status,
            user_id,
            created_at,
            profiles(
              id,
              name
            
            )
          )
        `)
        .eq('companies.owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setEmployerJobs(data || []);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchWorkerApplications = async () => {
    setDashboardLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs(
            id,
            title,
            pay,
            location,
            job_type,
            companies(name)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setWorkerApplications(data || []);
    } catch (err) {
      setError('Failed to fetch applications');
    } finally {
      setDashboardLoading(false);
    }
  };

  // Update application status
  // Fetch total available candidates for employer
  const fetchTotalCandidates = async () => {
    setCandidatesLoading(true);
    setError('');

    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'worker')
        .eq('is_available', true);

      if (error) {
        setError(error.message);
        return;
      }

      setTotalCandidates(count || 0);
    } catch (err) {
      setError('Failed to fetch candidates count');
    } finally {
      setCandidatesLoading(false);
    }
  };

  // Fetch interview invitations for worker
  const fetchInterviewInvitations = async () => {
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

  // OLD JOBS/APPLICATIONS FLOW - COMMENTED OUT
  // const updateApplicationStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
  //   try {
  //     const { error } = await supabase
  //       .from('applications')
  //       .update({ status: newStatus })
  //       .eq('id', applicationId);

  //     if (error) {
  //       setError('Failed to update application status');
  //       return;
  //     }
      
  //     await fetchEmployerJobs();
  //   } catch (err) {
  //     setError('Failed to update application status');
  //   }
  // };

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
              Dashboard
            </h1>
            <p className="text-foreground/60 mt-2">
              Welcome back, {profile?.name || 'User'} 👋
            </p>
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
              {/* Profile Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Your Profile Status
                </h2>

                {/* Check profile completion */}
                {(() => {
                  const requiredFields = ['phone', 'age', 'preferred_role', 'availability', 'hospitality_experience', 'start_availability'];
                  const missingFields = requiredFields.filter(field => !profile[field as keyof typeof profile]);
                  const isComplete = missingFields.length === 0;
                  const completionPercentage = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);

                  return (
                    <>
                      {/* Profile Completion Status */}
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

                      {/* Profile Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Availability Status */}
                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Availability Status</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${
                              profile.is_available ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                            <span className="font-medium text-foreground">
                              {profile.is_available ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                        </div>

                        {/* Preferred Role */}
                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Preferred Role</p>
                          <p className="font-medium text-foreground">
                            {profile.preferred_role || 'Not set'}
                          </p>
                        </div>

                        {/* Hospitality Experience */}
                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Hospitality Experience</p>
                          <p className="font-medium text-foreground">
                            {profile.hospitality_experience || 'Not set'}
                          </p>
                        </div>

                        {/* Can Start */}
                        <div className="bg-background/50 rounded-xl p-4">
                          <p className="text-sm text-foreground/60 mb-1">Can Start</p>
                          <p className="font-medium text-foreground">
                            {profile.start_availability || 'Not set'}
                          </p>
                        </div>
                      </div>

                      {/* Complete Profile Button */}
                      {!isComplete && (
                        <Link
                          href="/app/profile"
                          className="inline-block bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-sm font-medium"
                        >
                          Complete Profile
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Interview Requests Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Interview Requests
                </h2>

                {interviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading interview requests...</p>
                  </div>
                ) : interviewInvitations.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-foreground/60">
                      No interview requests yet.
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
            </div>
          )}

          {/* OLD WORKER DASHBOARD - APPLICATIONS VIEW - COMMENTED OUT
          {profile?.role === 'worker' && (
            <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Your Applications
                </h2>
                <Link
                  href="/jobs"
                  className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Browse Jobs
                </Link>
              </div>

              {dashboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-foreground/60">Loading applications...</p>
                </div>
              ) : workerApplications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-foreground/60 mb-4">
                    You have not applied to any jobs yet.
                  </p>
                  <Link
                    href="/jobs"
                    className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    Explore Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {workerApplications.map((application) => (
                    <div
                      key={application.id}
                      className="border border-primary/10 rounded-xl p-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {application.jobs?.title}
                          </h3>
                          <p className="text-sm text-foreground/60 mt-0.5">
                            {application.jobs?.companies?.name}
                          </p>
                          <p className="text-sm text-foreground/60 mt-2">
                            📍 {application.jobs?.location}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="font-medium text-primary">
                              {application.jobs?.pay}
                            </span>
                            <span className="text-foreground/40">
                              Applied: {new Date(application.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            application.status === 'accepted' 
                              ? 'bg-primary/10 text-primary'
                              : application.status === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-primary/5 text-primary'
                          }`}>
                            {application.status === 'accepted' && '✓ '}
                            {application.status === 'rejected' && '✗ '}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>

                          <div className="mt-2 text-sm">
                            {application.status === 'accepted' && (
                              <p className="text-primary font-medium">
                                Congratulations! You've been accepted.
                              </p>
                            )}
                            {application.status === 'rejected' && (
                              <p className="text-red-600">
                                This position wasn't a match.
                              </p>
                            )}
                            {application.status === 'pending' && (
                              <p className="text-foreground/40">
                                Under review
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          */}

          {/* EMPLOYER DASHBOARD */}
          {profile?.role === 'employer' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-foreground">
                  Employer Dashboard
                </h2>
              </div>

              {/* Candidates Overview Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-8">
                {candidatesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading candidates...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-6xl font-bold text-primary mb-2">
                        {totalCandidates}
                      </p>
                      <p className="text-foreground/60 text-lg">
                        Available Candidates
                      </p>
                    </div>

                    <div className="text-center">
                      <Link
                        href="/app/candidates"
                        className="inline-block bg-primary text-white px-8 py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-sm font-medium text-lg"
                      >
                        Browse Candidates
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* OLD EMPLOYER DASHBOARD - JOBS/APPLICATIONS VIEW - COMMENTED OUT
          {profile?.role === 'employer' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-foreground">
                  Employer Dashboard
                </h2>
                <Link
                  href="/post-job"
                  className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  + Post Job
                </Link>
              </div>

              {dashboardLoading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-foreground/60">Loading your jobs...</p>
                </div>
              ) : employerJobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-8 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    No jobs posted yet
                  </h3>
                  <p className="text-foreground/60 mb-5">
                    Start hiring by posting your first job.
                  </p>
                  <Link
                    href="/post-job"
                    className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    Create Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {employerJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl shadow-sm border border-primary/10 overflow-hidden"
                    >
                      <div className="p-5 border-b border-primary/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">
                              {job.title}
                            </h3>
                            <p className="text-foreground/60 text-sm mt-0.5">
                              {job.companies?.name}
                            </p>
                            <p className="text-sm text-foreground/60 mt-2">
                              📍 {job.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {job.pay}
                            </p>
                            <p className="text-sm text-foreground/40 mt-1">
                              {job.applications?.length || 0} applicants
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h4 className="font-medium text-foreground mb-4">Applicants</h4>
                        
                        {job.applications && job.applications.length > 0 ? (
                          <div className="space-y-3">
                            {job.applications.map((application) => (
                              <div
                                key={application.id}
                                className="border border-primary/10 rounded-xl p-4 bg-background/30"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">
                                      {application.profiles?.name || 'Unknown'}
                                    </p>
                                    <p className="text-sm text-foreground/40 mt-0.5">
                                      Applicant ID: {application.user_id}
                                    </p>
                                    <p className="text-xs text-foreground/30 mt-1">
                                      Applied: {new Date(application.created_at).toLocaleDateString()}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 ml-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      application.status === 'accepted' 
                                        ? 'bg-primary/10 text-primary'
                                        : application.status === 'rejected'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-primary/5 text-primary'
                                    }`}>
                                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </span>

                                    {application.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                          className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-foreground/40">
                              No applicants yet for this position.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          */}

        </div>
      </div>
    </div>
  );
}
