'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const [userRole, setUserRole] = useState<'job_seeker' | 'employer'>('job_seeker');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Role selector for demo purposes */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Role (for demo):
          </label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as 'job_seeker' | 'employer')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="job_seeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        {userRole === 'job_seeker' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Job Seeker Dashboard</h2>
              <p className="text-gray-600 mb-4">
                Welcome to your job seeker dashboard! Here you can manage your applications and profile.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Applied Jobs</h3>
                  <p className="text-blue-700">You have applied to 3 jobs</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Profile Completion</h3>
                  <p className="text-green-700">Your profile is 80% complete</p>
                </div>
              </div>
              
              <div className="mt-6">
                <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors mr-4">
                  View Jobs
                </button>
                <button className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Employer Dashboard</h2>
              <p className="text-gray-600 mb-4">
                Welcome to your employer dashboard! Manage your job postings and view applicants.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Active Job Postings</h3>
                  <p className="text-purple-700">You have 2 active job postings</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Total Applicants</h3>
                  <p className="text-orange-700">15 applicants across all jobs</p>
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
        )}
      </div>
      </div>
    </div>
  );
}
