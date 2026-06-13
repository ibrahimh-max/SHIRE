import MobileLayout from '@/components/mobile/MobileLayout';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileLayout>
      {children}
    </MobileLayout>
  );
}
