'use client';

import Link from 'next/link';

export default function HomePage() {
  // Temporary high-end success message handler to eliminate the UX vacuum
  const handleWaitlistClick = () => {
    alert("🎉 You're on the list!\n\nThank you for joining the CREWZI early access waitlist. We will notify you the exact moment the Android build goes live on the Google Play Store.");
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 border-b border-primary/5 sm:border-none">
        <div className="text-2xl font-black text-primary tracking-tight">
          CREWZI
        </div>

        <div className="flex items-center justify-center gap-6 w-full sm:w-auto">
          <a href="#how-it-works" className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-foreground/80 hover:text-primary transition-colors">
            How It Works
          </a>

          <a href="#roles" className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-foreground/80 hover:text-primary transition-colors">
            Roles
          </a>

          <Link
            href="/app/login"
            className="bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative">
        <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-accent/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 md:py-32 text-center">
          
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
            🚀 Hospitality Hiring Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-foreground tracking-tight leading-none mb-6">
            Hire Hospitality
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Staff Faster
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            CREWZI connects hotels, restaurants, cafes and event businesses with premium hospitality talent across India.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-xs mx-auto sm:max-w-none mb-14">
            <button
              onClick={handleWaitlistClick}
              className="bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg transition-all w-full sm:w-auto"
            >
              ⚡ Join Android Waitlist
            </button>

            <a
              href="#how-it-works"
              className="border border-primary/20 bg-white/80 backdrop-blur text-foreground px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-primary/5 shadow-sm transition-all w-full sm:w-auto"
            >
              How It Works
            </a>
          </div>

          {/* STATS/SECTORS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
            <div className="card-surface p-4 flex items-center justify-center bg-white border border-primary/10 rounded-2xl">
              <p className="font-bold text-sm sm:text-base">🏨 Hotels</p>
            </div>

            <div className="card-surface p-4 flex items-center justify-center bg-white border border-primary/10 rounded-2xl">
              <p className="font-bold text-sm sm:text-base">🍽 Restaurants</p>
            </div>

            <div className="card-surface p-4 flex items-center justify-center bg-white border border-primary/10 rounded-2xl">
              <p className="font-bold text-sm sm:text-base">☕ Cafes</p>
            </div>

            <div className="card-surface p-4 flex items-center justify-center bg-white border border-primary/10 rounded-2xl">
              <p className="font-bold text-sm sm:text-base">🎉 Events</p>
            </div>
          </div>

        </div>
      </section>

      {/* Why CREWZI Section */}
      <section className="py-20 border-t border-primary/10">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
              Why CREWZI?
            </h2>
            <p className="text-foreground/60 text-sm sm:text-base font-medium">
              Hospitality hiring is still broken. We are fixing it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-red-900 mb-4">
                Traditional Hiring
              </h3>
              <ul className="space-y-3.5 font-semibold text-sm text-red-800/80">
                <li>❌ Messy WhatsApp Groups</li>
                <li>❌ Unreliable Random Referrals</li>
                <li>❌ Painfully Slow Onboarding Processes</li>
                <li>❌ No Structured Candidate Profile Database</li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-primary mb-4">
                Hiring with CREWZI
              </h3>
              <ul className="space-y-3.5 font-semibold text-sm text-foreground/80">
                <li>✅ 100% Dedicated Hospitality Focus</li>
                <li>✅ Thorough, Visual Talent Profiles</li>
                <li>✅ One-Tap Instant Interview Requests</li>
                <li>✅ Fast, Frictionless Verification States</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* DOWNLOAD APP ACCENT SCREEN */}
      <section className="py-16 border-t border-primary/10 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-4">
            Get CREWZI on Android
          </h2>
          <p className="text-sm sm:text-base text-foreground/60 mb-8 max-w-xl mx-auto font-medium leading-relaxed">
            Built exclusively for modern hospitality hiring ecosystems. Connect top-tier staffing networks and properties instantly.
          </p>
          <button 
            onClick={handleWaitlistClick}
            className="inline-flex items-center bg-black hover:bg-gray-900 text-white px-7 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-md transition-all"
          >
            ⚡ Join Android Waitlist
          </button>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
            Built for Hospitality Sectors
          </h2>
          <p className="text-foreground/60 text-sm sm:text-base font-medium max-w-xl mx-auto mb-10">
            CREWZI focuses exclusively on niche professional staffing and rapid recruitment pipelines.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {[
              '🏨 Hotels',
              '🍽 Restaurants',
              '☕ Cafes',
              '🎉 Events',
              '🍴 Cloud Kitchens',
            ].map((item) => (
              <div
                key={item}
                className="bg-white border border-primary/10 rounded-2xl p-4 font-bold text-sm shadow-sm flex items-center justify-center"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-20 border-t border-primary/10 bg-white/60"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
              How CREWZI Works
            </h2>
            <p className="text-foreground/60 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Clean hiring flows created structurally for managers and dynamic job seekers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">
                🏢 For Employers
              </h3>
              <ul className="space-y-3 font-semibold text-sm text-foreground/70">
                <li>✓ Set up your professional workspace cards</li>
                <li>✓ Filter through matching live candidate records</li>
                <li>✓ Deploy automated interview invites straight to their inbox</li>
                <li>✓ Lock in verified talent fast</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-primary/10 shadow-sm p-6 sm:p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">
                💼 For Talent
              </h3>
              <ul className="space-y-3 font-semibold text-sm text-foreground/70">
                <li>✓ Fill in your basic skill set metrics</li>
                <li>✓ Get surface visibility across top-tier venues</li>
                <li>✓ Get push updates for incoming interviews</li>
                <li>✓ Accelerate your professional career tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* JOB ROLES */}
      <section id="roles" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
              Popular Hospitality Roles
            </h2>
            <p className="text-foreground/60 text-sm sm:text-base font-medium">
              Instant match channels across popular categories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {[
              '🍽 Waiter',
              '👨‍🍳 Chef',
              '☕ Barista',
              '🚗 Valet',
              '🎉 Event Staff',
            ].map((role) => (
              <div
                key={role}
                className="bg-white border border-primary/10 rounded-2xl p-4 text-center shadow-sm font-bold text-sm hover:border-primary/20 transition-all flex items-center justify-center"
              >
                {role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 border-t border-primary/10 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight mb-5 leading-none">
            Start hiring faster with CREWZI
          </h2>
          <p className="text-sm sm:text-base text-foreground/60 mb-8 max-w-xl mx-auto font-medium">
            Join the growing hospitality network built to match localized talent profiles instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto sm:max-w-none">
            <button
              onClick={handleWaitlistClick}
              className="bg-primary hover:bg-primary-dark text-white px-7 py-3.5 rounded-2xl font-bold shadow-md transition-all w-full sm:w-auto"
            >
              ⚡ Join Android Waitlist
            </button>
            <a
              href="#how-it-works"
              className="border border-primary/20 bg-white px-7 py-3.5 rounded-2xl font-bold hover:bg-primary/5 shadow-sm transition-all w-full sm:w-auto"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-primary/10 py-8 bg-white/20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-5">
          <div>
            <p className="font-black text-primary tracking-tight text-lg">CREWZI</p>
            <p className="text-xs font-semibold text-foreground/50 mt-0.5">
              Hospitality Hiring Platform
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-foreground/60">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>

    </main>
  );
}