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
                : 'Talent'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {profile?.name && (
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          <button
            onClick={signOut}
            className="text-red-500 hover:bg-red-50 relative z-50 flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition-colors"
            aria-label="Logout"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
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