'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
    console.log('🔍 Dashboard auth state:', {
      loading,
      authInitialized,
      hasUser: !!user,
      hasProfile: !!profile
    });

    // Wait until auth fully initializes
    if (loading || !authInitialized) {
      return;
    }

    // Redirect only if auth finished AND no user
    if (!user) {
      console.log('🚪 No authenticated user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ Dashboard access granted');
  }, [user, profile, loading, authInitialized, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user || !profile) return;

    console.log('📊 Loading dashboard data for:', profile.role);

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
          companies(name),
          applications(id, status, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Employer jobs fetch error:', error);
        setError(error.message);
        return;
      }

      setEmployerJobs(data || []);
    } catch (err) {
      console.error('❌ Employer jobs exception:', err);
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
        console.error('❌ Worker applications fetch error:', error);
        setError(error.message);
        return;
      }

      setWorkerApplications(data || []);
    } catch (err) {
      console.error('❌ Worker applications exception:', err);
      setError('Failed to fetch applications');
    } finally {
      setDashboardLoading(false);
    }
  };

  // Initial auth loading
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirecting
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

          {/* Missing profile */}
          {user && !profile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Profile not found
              </h2>

              <p className="text-gray-600 mb-4">
                Your account exists but profile data is missing.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
              >
                Refresh
              </button>
            </div>
          )}

          {/* WORKER DASHBOARD */}
          {profile?.role === 'worker' && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Your Applications
                </h2>

                <Link
                  href="/jobs"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  Browse Jobs
                </Link>
              </div>

              {dashboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading applications...</p>
                </div>
              ) : workerApplications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-4">
                    You have not applied to any jobs yet.
                  </p>

                  <Link
                    href="/jobs"
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl"
                  >
                    Explore Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {workerApplications.map((application) => (
                    <div
                      key={application.id}
                      className="border rounded-xl p-4"
                    >
                      <h3 className="font-semibold text-lg">
                        {application.jobs?.title}
                      </h3>

                      <p className="text-sm text-gray-600">
                        {application.jobs?.companies?.name}
                      </p>

                      <div className="mt-2 flex justify-between text-sm">
                        <span>{application.jobs?.pay}</span>

                        <span className="capitalize">
                          {application.status}
                        </span>
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
                <h2 className="text-2xl font-semibold">
                  Employer Dashboard
                </h2>

                <Link
                  href="/post-job"
                  className="bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                  Post Job
                </Link>
              </div>

              {dashboardLoading ? (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p>Loading your jobs...</p>
                </div>
              ) : employerJobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                  <h3 className="text-xl font-semibold mb-3">
                    No jobs posted yet
                  </h3>

                  <p className="text-gray-600 mb-5">
                    Start hiring by posting your first job.
                  </p>

                  <Link
                    href="/post-job"
                    className="bg-green-600 text-white px-5 py-2 rounded-xl"
                  >
                    Create Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {employerJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {job.title}
                          </h3>

                          <p className="text-gray-600 text-sm">
                            {job.companies?.name}
                          </p>

                          <p className="text-sm mt-1">
                            📍 {job.location}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            {job.pay}
                          </p>

                          <p className="text-sm text-gray-500">
                            {(job.applications?.length || 0)} applicants
                          </p>
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