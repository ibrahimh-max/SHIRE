import AppGuard from '@/components/AppGuard';
import MobileLayout from '@/components/mobile/MobileLayout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppGuard>
      <MobileLayout>
        {children}
      </MobileLayout>
    </AppGuard>
  );
}