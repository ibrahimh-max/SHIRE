'use client';

export default function AppGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}