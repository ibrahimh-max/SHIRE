import AppGuard from '@/components/AppGuard';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppGuard>
      {children}
    </AppGuard>
  );
}