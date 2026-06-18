export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Account Deletion</h1>

        <p className="text-gray-600 mb-6">
          Last Updated: June 2026
        </p>

        <p className="mb-6">
          Crewzi allows users to permanently delete their account directly
          from within the application.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          How to Delete Your Account
        </h2>

        <ol className="list-decimal pl-6 space-y-2 mb-6">
          <li>Log in to your Crewzi account.</li>
          <li>Navigate to the Profile section.</li>
          <li>Select the Delete Account option.</li>
          <li>Confirm the account deletion request.</li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          What Happens When You Delete Your Account
        </h2>

        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Your account will be permanently deleted.</li>
          <li>Your profile information will be removed.</li>
          <li>Your access to Crewzi will be revoked.</li>
          <li>
            Certain records may be retained only if required for legal,
            security, or compliance purposes.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Need Help?
        </h2>

        <p>
          If you need assistance deleting your account, please contact us at:
        </p>

        <p className="mt-2 font-medium">
          support@crewzi.in
        </p>
      </div>
    </main>
  );
}