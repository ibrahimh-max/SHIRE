'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/* ──────────────────────────────────────────────
   SVG icon components – kept inline to avoid
   adding an icon library dependency.
   ────────────────────────────────────────────── */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? 'currentColor' : 'currentColor'}
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v9a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1v-9" />
    </svg>
  );
}

function RequestsIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function WorkersIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function CompanyIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Navigation item type
   ────────────────────────────────────────────── */

interface NavItem {
  label: string;
  href: string;
  icon: (props: { active: boolean }) => React.ReactNode;
}

/* ──────────────────────────────────────────────
   Route configs per role
   ────────────────────────────────────────────── */

const WORKER_NAV: NavItem[] = [
  { label: 'Home', href: '/app/dashboard', icon: HomeIcon },
  { label: 'Requests', href: '/app/requests', icon: RequestsIcon },
  { label: 'Profile', href: '/app/profile', icon: ProfileIcon },
];

const EMPLOYER_NAV: NavItem[] = [
  { label: 'Home', href: '/app/dashboard', icon: HomeIcon },
  { label: 'Talent', href: '/app/candidates', icon: WorkersIcon },
  { label: 'Requests', href: '/app/requests', icon: RequestsIcon },
  { label: 'Company', href: '/app/create-company', icon: CompanyIcon },
];

/* ──────────────────────────────────────────────
   BottomNav component
   ────────────────────────────────────────────── */

export default function BottomNav() {
  const { profile } = useAuth();
  const pathname = usePathname();

  // Don't render until we know the role
  if (!profile?.role) return null;

  const items = profile.role === 'employer' ? EMPLOYER_NAV : WORKER_NAV;

  return (
    <nav
      id="bottom-nav"
      className="bottom-nav"
      aria-label="Mobile navigation"
    >
      {/* Frosted glass backdrop strip */}
      <div className="bottom-nav__track">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
            >
              {/* Active indicator pill */}
              {isActive && <span className="bottom-nav__indicator" />}

              <span className="bottom-nav__icon">
                <item.icon active={isActive} />
              </span>

              <span className="bottom-nav__label">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
