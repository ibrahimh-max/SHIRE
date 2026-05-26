'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Left — logo + links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary">
              CREWZI
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/jobs"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-primary/5 transition-all"
              >
                Jobs
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-primary/5 transition-all"
                >
                  Dashboard
                </Link>
              )}
              {user && profile?.role === 'employer' && (
                <Link
                  href="/post-job"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-primary/5 transition-all"
                >
                  Post job
                </Link>
              )}
            </div>
          </div>

          {/* Right — auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Role pill */}
                {profile?.role && (
                  <span
                    className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: profile.role === 'employer' ? '#EAF3DE' : 'rgba(0, 173, 181, 0.1)',
                      color: profile.role === 'employer' ? '#3B6D11' : '#00ADB5',
                    }}
                  >
                    {profile.role === 'employer' ? 'Employer' : 'Worker'}
                  </span>
                )}

                {/* Name */}
                <span className="text-sm text-foreground/40 hidden sm:block">
                  {profile?.name?.split(' ')[0] || 'User'}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-foreground/60 hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/60 hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all bg-primary hover:bg-primary-dark"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}