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

  const isDev = process.env.NODE_ENV === 'development';
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Allow localhost during development
    if (!isNative && !isDev) {
      router.replace('/');
    }
  }, [router, isNative, isDev]);

  // Block browser access only in production
  if (!isNative && !isDev) {
    return null;
  }

  return <>{children}</>;
}