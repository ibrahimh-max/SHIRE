'use client';

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

          {/* Left — logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-primary">
              CREWZI
            </span>
          </div>

          {/* Right — auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Role pill */}
                {profile?.role && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: profile.role === 'employer' ? '#EAF3DE' : 'rgba(0, 173, 181, 0.1)',
                      color: profile.role === 'employer' ? '#3B6D11' : '#00ADB5',
                    }}
                  >
                    {profile.role === 'employer' ? 'Employer' : 'Talent'}
                  </span>
                )}

                {/* Name */}
                <span className="text-sm text-foreground/40">
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
                <a
                  href="/app/login"
                  className="text-sm font-medium text-foreground/60 hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
                >
                  Log in
                </a>
                <a
                  href="/app/signup"
                  className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all bg-primary hover:bg-primary-dark"
                >
                  Sign up
                </a>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}