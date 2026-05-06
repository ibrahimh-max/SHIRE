'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-plum-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              SHIRE
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link href="/jobs" className="text-foreground/70 hover:text-primary transition-colors font-medium">
                Jobs
              </Link>
              {user && (
                <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition-colors font-medium">
                  Dashboard
                </Link>
              )}
              {user && profile?.role === 'employer' && (
                <Link href="/post-job" className="text-foreground/70 hover:text-primary transition-colors font-medium">
                  Post Job
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-foreground/60 text-sm">
                  Hey, {profile?.name?.split(' ')[0] || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-foreground/70 hover:text-primary transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-foreground/70 hover:text-primary transition-colors font-medium">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-all shadow-sm hover:shadow-md font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}