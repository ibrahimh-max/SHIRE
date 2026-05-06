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
  const [redirecting, setRedirecting] = useState(false);

  // Handle redirect to login if not authenticated - ONLY after auth initialization is complete
  useEffect(() => {
    console.log('🔍 Dashboard auth check:', { loading, authInitialized, hasUser: !!user });
    
    // Do NOT redirect if auth is still loading or not initialized
    if (loading || !authInitialized) {
      console.log('⏳ Dashboard: Auth still initializing, waiting...');
      return;
    }
    
    // Only redirect if auth is complete AND no user found
    if (authInitialized && !user) {
      console.log('🚪 Dashboard: Auth initialized but no user, redirecting to login');
      setRedirecting(true);
      router.push('/login');
    }
  }, [user, loading, authInitialized, router]);

  // Fetch dashboard data when user and profile are available
  useEffect(() => {
    if (user && profile && !redirecting && authInitialized) {
      console.log('📊 Dashboard: Fetching data for', profile.role, user.id);
      if (profile.role === 'employer') {
        fetchEmployerJobs();
      } else if (profile.role === 'worker') {
        fetchWorkerApplications();
      }
    }
  }, [user, profile, redirecting, authInitialized]);

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
        .eq('companies.owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setEmployerJobs(data || []);
    } catch (err) {
      setError('Failed to fetch your jobs');
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
      setError('Failed to fetch your applications');
    } finally {
      setDashboardLoading(false);
    }
  };

  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {!authInitialized ? 'Initializing authentication...' : 'Loading your account...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to login...</p>
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
          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-foreground/60 mt-1">Welcome back, {profile?.name?.split(' ')[0] || 'User'} 👋</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {profile?.role === 'worker' ? (
            /* WORKER DASHBOARD */
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-primary/10 p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Your applications</h2>

                {dashboardLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading applications...</p>
                  </div>
                ) : workerApplications.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-foreground/60 mb-4">You haven't applied to any jobs yet</p>
                    <Link href="/jobs" className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all font-medium inline-block">
                      Browse jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workerApplications.map((application) => {
                      const statusColors = {
                        pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                        accepted: 'bg-green-50 text-green-700 border-green-200',
                        rejected: 'bg-red-50 text-red-700 border-red-200'
                      };
                      const statusColor = statusColors[application.status as keyof typeof statusColors] || statusColors.pending;

                      return (
                        <div key={application.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{application.jobs?.title}</h3>
                              <p className="text-primary text-sm">{application.jobs?.companies?.name}</p>
                              <p className="text-foreground/50 text-sm mt-1">📍 {application.jobs?.location}</p>
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-foreground/60 mt-3 pt-2 border-t border-gray-50">
                            <span className="font-medium">{application.jobs?.pay}</span>
                            <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : profile?.role === 'employer' ? (
            /* EMPLOYER DASHBOARD */
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                  <p className="text-foreground/60 text-sm mb-1">Total jobs posted</p>
                  <p className="text-3xl font-bold text-primary">{employerJobs.length}</p>
                </div>

                <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 border border-accent/20">
                  <p className="text-foreground/60 text-sm mb-1">Total applicants</p>
                  <p className="text-3xl font-bold text-accent-dark">
                    {employerJobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
                  <p className="text-foreground/60 text-sm mb-1">Active openings</p>
                  <p className="text-3xl font-bold text-foreground">{employerJobs.length}</p>
                </div>
              </div>

              {/* Job postings */}
              <div className="bg-white rounded-2xl shadow-md border border-primary/10 p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-foreground">Your job postings</h2>
                  <Link href="/post-job" className="bg-accent text-white px-4 py-2 rounded-xl hover:bg-accent-dark transition-all text-sm font-medium">
                    + Post new job
                  </Link>
                </div>

                {dashboardLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground/60">Loading jobs...</p>
                  </div>
                ) : employerJobs.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-foreground/60 mb-4">You haven't posted any jobs yet</p>
                    <Link href="/post-job" className="bg-accent text-white px-5 py-2.5 rounded-xl hover:bg-accent-dark transition-all font-medium inline-block">
                      Post your first job
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employerJobs.map((job) => (
                      <div key={job.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                            <p className="text-primary text-sm">{job.companies?.name}</p>
                            <p className="text-foreground/50 text-sm mt-1">📍 {job.location}</p>
                          </div>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            {job.applications?.length || 0} applicant{(job.applications?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-foreground/60 mt-3 pt-2 border-t border-gray-50">
                          <span className="font-medium">{job.pay}</span>
                          <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-primary/10 p-6 text-center">
              <p className="text-foreground/60">Loading your profile...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}