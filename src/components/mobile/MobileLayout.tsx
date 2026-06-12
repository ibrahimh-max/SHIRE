'use client';

import { useAuth } from '@/contexts/AuthContext';
import BottomNav from './BottomNav';

/* ──────────────────────────────────────────────
   MobileLayout
   ──────────────────────────────────────────────
   Wraps every /app/* page with:
     • Top header (branding + user info)
     • Scrollable content area
     • Fixed bottom navigation

   Does NOT touch any business logic or
   redesign the pages themselves.
   ────────────────────────────────────────────── */

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();

  return (
    <div className="mobile-layout">
      {/* ─── Top Header ─── */}
      <header className="mobile-header" id="mobile-header">
        <span className="mobile-header__brand">CREWZI</span>

        {profile?.role && (
          <span
            className={`mobile-header__role ${
              profile.role === 'employer'
                ? 'mobile-header__role--employer'
                : 'mobile-header__role--worker'
            }`}
          >
            {profile.role === 'employer' ? 'Employer' : 'Worker'}
          </span>
        )}
      </header>

      {/* ─── Page Content ─── */}
      <main className="mobile-content" id="mobile-content">
        {children}
      </main>

      {/* ─── Bottom Navigation ─── */}
      <BottomNav />
    </div>
  );
}
