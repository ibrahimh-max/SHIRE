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

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) {
      router.replace('/');
    }
  }, [router, isNative]);

  if (!isNative) {
    return null;
  }

  return <>{children}</>;
}