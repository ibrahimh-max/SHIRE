import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CREWZI - Hospitality Hiring Platform',
  description: 'Connect with hospitality jobs and talent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}

          <footer className="mt-16 border-t bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                  © 2026 CREWZI. All rights reserved.
                </p>

                <div className="flex gap-6 text-sm">
                  <Link
                    href="/privacy-policy"
                    className="text-gray-600 hover:text-black"
                  >
                    Privacy Policy
                  </Link>

                  <Link
                    href="/terms"
                    className="text-gray-600 hover:text-black"
                  >
                    Terms & Conditions
                  </Link>
                </div>
              </div>
            </div>
          </footer>
          <script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js');
        });
      }
    `,
  }}
/>
        </AuthProvider>
      </body>
    </html>
  );
}