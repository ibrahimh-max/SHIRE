'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

  // Handle authentication redirect
  useEffect(() => {
    if (loading || !authInitialized) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, profile, loading, authInitialized, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user || !profile) return;

    if (profile.role === 'employer') {
      fetchEmployerJobs();
    }

    if (profile.role === 'worker') {
      fetchWorkerApplications();
    }
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
  const updateApplicationStatus = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) {
        setError('Failed to update application status');
        return;
      }
      
      await fetchEmployerJobs();
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  // Initial auth loading
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {profile?.name || 'User'} 👋
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Missing profile */}
          {user && !profile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Profile not found
              </h2>
              <p className="text-gray-600 mb-4">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
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
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : workerApplications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-4">
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
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {application.jobs?.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {application.jobs?.companies?.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            📍 {application.jobs?.location}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="font-medium text-primary">
                              {application.jobs?.pay}
                            </span>
                            <span className="text-gray-500">
                              Applied: {new Date(application.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          {/* Status Badge */}
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            application.status === 'accepted' 
                              ? 'bg-green-50 text-green-700'
                              : application.status === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}>
                            {application.status === 'accepted' && '✓ '}
                            {application.status === 'rejected' && '✗ '}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>

                          {/* Status Message */}
                          <div className="mt-2 text-sm">
                            {application.status === 'accepted' && (
                              <p className="text-green-600 font-medium">
                                Congratulations! You've been accepted.
                              </p>
                            )}
                            {application.status === 'rejected' && (
                              <p className="text-red-600">
                                This position wasn't a match.
                              </p>
                            )}
                            {application.status === 'pending' && (
                              <p className="text-gray-500">
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

          {/* EMPLOYER DASHBOARD */}
          {profile?.role === 'employer' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your jobs...</p>
                </div>
              ) : employerJobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No jobs posted yet
                  </h3>
                  <p className="text-gray-600 mb-5">
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
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      {/* Job Header */}
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-0.5">
                              {job.companies?.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              📍 {job.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {job.pay}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {job.applications?.length || 0} applicants
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Applicants Section */}
                      <div className="p-5">
                        <h4 className="font-medium text-gray-900 mb-4">Applicants</h4>
                        
                        {job.applications && job.applications.length > 0 ? (
                          <div className="space-y-3">
                            {job.applications.map((application) => (
                              <div
                                key={application.id}
                                className="border border-gray-200 rounded-xl p-4 bg-gray-50/30"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {application.profiles?.name || 'Unknown'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                      Applicant ID: {application.user_id}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Applied: {new Date(application.created_at).toLocaleDateString()}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 ml-4">
                                    {/* Status Badge */}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      application.status === 'accepted' 
                                        ? 'bg-green-50 text-green-700'
                                        : application.status === 'rejected'
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-purple-50 text-purple-700'
                                    }`}>
                                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </span>

                                    {/* Action Buttons - Only show if pending */}
                                    {application.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
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
                            <p className="text-gray-500">
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

        </div>
      </div>
    </div>
  );
}