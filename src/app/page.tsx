import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-10 bg-white dark:bg-zinc-950">
      <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
        SHIRE Hospitality Hiring Platform
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 text-center">
        Connect hospitality businesses with skilled workers quickly.
      </p>

      <div className="mt-8 flex gap-4">
        <a href="/jobs" className="rounded-full bg-black px-6 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
          Browse Jobs
        </a>
        <a href="/signup" className="rounded-full border border-zinc-300 px-6 py-3 hover:bg-zinc-50 dark:border-zinc-700">
          Get Started
        </a>
      </div>
    </main>
  );
}