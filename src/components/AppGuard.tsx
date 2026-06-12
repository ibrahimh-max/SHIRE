'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

export default function AppGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      router.replace('/');
    }
  }, [router]);

  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return <>{children}</>;
}