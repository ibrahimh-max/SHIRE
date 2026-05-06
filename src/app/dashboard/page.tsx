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
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [employerJobs, setEmployerJobs] = useState<EmployerJob[]>([]);
  const [workerApplications, setWorkerApplications] = useState<WorkerApplication[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'employer') {
        fetchEmployerJobs();
      } else if (profile.role === 'worker') {
        fetchWorkerApplications();
      }
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome back, {profile?.name || 'User'}!</h2>
            <p className="text-gray-600">
              You are logged in as a <span className="font-semibold capitalize">{profile?.role}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {profile?.role === 'worker' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Job Applications</h2>
                
                {dashboardLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading applications...</p>
                  </div>
                ) : workerApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You haven't applied to any jobs yet.</p>
                    <Link href="/jobs" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workerApplications.map((application) => (
                      <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{application.jobs?.title}</h3>
                            <p className="text-gray-600">{application.jobs?.companies?.name}</p>
                            <p className="text-gray-500 text-sm">{application.jobs?.location}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>{application.jobs?.pay}</span>
                          <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : profile?.role === 'employer' ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold text-purple-900 mb-2">Total Jobs Posted</h3>
                  <p className="text-3xl font-bold text-purple-600">{employerJobs.length}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold text-orange-900 mb-2">Total Applicants</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {employerJobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0)}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold text-green-900 mb-2">Active Jobs</h3>
                  <p className="text-3xl font-bold text-green-600">{employerJobs.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Job Postings</h2>
                  <Link href="/post-job" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Post New Job
                  </Link>
                </div>
                
                {dashboardLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading jobs...</p>
                  </div>
                ) : employerJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
                    <Link href="/post-job" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                      Post Your First Job
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employerJobs.map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-gray-600">{job.companies?.name}</p>
                            <p className="text-gray-500 text-sm">{job.location}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {job.applications?.length || 0} applicant{(job.applications?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>{job.pay}</span>
                          <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Loading your profile information...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
