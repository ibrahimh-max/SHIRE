import Link from 'next/link';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
    </>
  );
}
