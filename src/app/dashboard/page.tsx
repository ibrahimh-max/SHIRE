'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome back, {profile?.name || 'User'}!</h2>
            <p className="text-gray-600">
              You are logged in as a <span className="font-semibold capitalize">{profile?.role}</span>
            </p>
          </div>

          {profile?.role === 'worker' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Worker Dashboard</h2>
                <p className="text-gray-600 mb-6">
                  Here you can manage your job applications and profile.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Applications</h3>
                    <p className="text-blue-700">View and track your job applications</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Profile</h3>
                    <p className="text-green-700">Update your personal information</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors mr-4">
                    Browse Jobs
                  </button>
                  <button className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          ) : profile?.role === 'employer' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Employer Dashboard</h2>
                <p className="text-gray-600 mb-6">
                  Manage your job postings and view applicants.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Job Postings</h3>
                    <p className="text-purple-700">Create and manage job listings</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">Applicants</h3>
                    <p className="text-orange-700">Review and manage applications</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors mr-4">
                    Post New Job
                  </button>
                  <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
                    View Applicants
                  </button>
                </div>
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
