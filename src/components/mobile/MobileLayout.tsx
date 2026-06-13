'use client';

import { useAuth } from '@/contexts/AuthContext';
import BottomNav from './BottomNav';

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, signOut } = useAuth();

  return (
    <div className="mobile-layout">

      {/* Header */}
      <header className="mobile-header">

        <div className="flex items-center gap-3">
          <span className="mobile-header__brand">
            CREWZI
          </span>

          {profile?.role && (
            <span
              className={`mobile-header__role ${
                profile.role === 'employer'
                  ? 'mobile-header__role--employer'
                  : 'mobile-header__role--worker'
              }`}
            >
              {profile.role === 'employer'
                ? 'Employer'
                : 'Worker'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">

          <span className="text-sm text-gray-500">
            {profile?.name?.split(' ')[0]}
          </span>

          <button
            onClick={signOut}
            className="text-sm font-medium text-red-500"
          >
            Logout
          </button>

        </div>

      </header>

      {/* Content */}
      <main className="mobile-content">
        {children}
      </main>

      {/* Bottom Nav */}
      <BottomNav />

    </div>
  );
}