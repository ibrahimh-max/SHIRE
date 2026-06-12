import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">

      {/* Add Simple Navbar */}
      <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-2xl font-bold text-primary">
          CREWZI
        </div>

        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-sm font-medium">
            How It Works
          </a>

          <a href="#roles" className="text-sm font-medium">
            Roles
          </a>

          <Link
            href="/app/login"
            className="bg-primary text-white px-4 py-2 rounded-xl"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative">

        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">

          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            🚀 Hospitality Hiring Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            Hire Hospitality
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Staff Faster
            </span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto mb-10 leading-relaxed">
            CREWZI connects hotels, restaurants, cafes and event businesses
            with hospitality workers across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">

            {/* Hero Buttons - Updated */}
            <button
              className="bg-primary text-white px-8 py-4 rounded-2xl font-medium text-lg shadow-lg cursor-not-allowed opacity-90"
            >
              📱 Coming Soon on Google Play
            </button>

            <a
              href="#how-it-works"
              className="border border-primary/20 bg-white/70 backdrop-blur text-foreground px-8 py-4 rounded-2xl font-medium text-lg hover:bg-primary/5 transition-all"
            >
              How It Works
            </a>

          </div>

          {/* REPLACED STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="font-semibold">🏨 Hotels</p>
            </div>

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="font-semibold">🍽 Restaurants</p>
            </div>

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="font-semibold">☕ Cafes</p>
            </div>

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="font-semibold">🎉 Events</p>
            </div>

          </div>

        </div>
      </section>

      {/* Why CREWZI Section - New */}
      <section className="py-24 border-t border-primary/10">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why CREWZI?
            </h2>

            <p className="text-foreground/60">
              Hospitality hiring is still broken. We're fixing it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <div className="bg-red-50 border border-red-100 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-6">
                Traditional Hiring
              </h3>

              <ul className="space-y-4">
                <li>❌ WhatsApp Groups</li>
                <li>❌ Random Referrals</li>
                <li>❌ Slow Hiring Process</li>
                <li>❌ No Candidate Database</li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-6">
                Hiring with CREWZI
              </h3>

              <ul className="space-y-4">
                <li>✅ Hospitality Focused</li>
                <li>✅ Worker Profiles</li>
                <li>✅ Interview Requests</li>
                <li>✅ Faster Hiring</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* DOWNLOAD APP - Updated */}
      <section className="py-20 border-t border-primary/10 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">

          <h2 className="text-4xl font-bold mb-6">
            Get CREWZI on Android
          </h2>

          <p className="text-lg text-foreground/60 mb-8">
            Built exclusively for hospitality hiring. Connect employers and workers faster than traditional hiring methods.
          </p>

          <button className="inline-flex items-center bg-black text-white px-8 py-4 rounded-2xl font-medium cursor-not-allowed opacity-90">
            📱 Coming Soon on Google Play
          </button>

        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">

          <h2 className="text-4xl font-bold mb-4">
            Built for the Hospitality Industry
          </h2>

          <p className="text-foreground/60 max-w-2xl mx-auto mb-12">
            CREWZI focuses exclusively on hospitality staffing and recruitment.
          </p>

          <div className="grid md:grid-cols-5 gap-4">

            {[
              '🏨 Hotels',
              '🍽 Restaurants',
              '☕ Cafes',
              '🎉 Events',
              '🍴 Cloud Kitchens',
            ].map((item) => (
              <div
                key={item}
                className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm"
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
        className="py-24 border-t border-primary/10 bg-white/40"
      >
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How CREWZI Works
            </h2>

            <p className="text-foreground/60 max-w-2xl mx-auto">
              Simple hiring flow built specifically for the hospitality industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <div className="bg-white rounded-3xl border border-primary/10 shadow-sm p-8">
              <h3 className="text-2xl font-semibold mb-6">
                🏢 For Employers
              </h3>

              <ul className="space-y-4 text-foreground/70">
                <li>✓ Create your company profile</li>
                <li>✓ Browse hospitality workers</li>
                <li>✓ Request interviews instantly</li>
                <li>✓ Hire faster with CREWZI</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-primary/10 shadow-sm p-8">
              <h3 className="text-2xl font-semibold mb-6">
                💼 For Workers
              </h3>

              <ul className="space-y-4 text-foreground/70">
                <li>✓ Create your hospitality profile</li>
                <li>✓ Get discovered by employers</li>
                <li>✓ Receive interview requests</li>
                <li>✓ Grow your hospitality career</li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* JOB ROLES */}
      <section id="roles" className="py-24">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Popular Hospitality Roles
            </h2>

            <p className="text-foreground/60">
              Find opportunities across hotels, cafes, restaurants, and events.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

            {[
              '🍽 Waiter',
              '👨‍🍳 Chef',
              '☕ Barista',
              '🚗 Valet',
              '🎉 Event Staff',
            ].map((role) => (
              <div
                key={role}
                className="bg-white border border-primary/10 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all"
              >
                <p className="font-medium">{role}</p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* FINAL CTA - Updated */}
      <section className="py-24 border-t border-primary/10 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start hiring faster with CREWZI
          </h2>

          <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto">
            Join the growing hospitality hiring network built for modern staffing needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <button
              className="bg-primary text-white px-8 py-4 rounded-2xl font-medium shadow-lg cursor-not-allowed"
            >
              📱 Coming Soon
            </button>

            <a
              href="#how-it-works"
              className="border border-primary/20 bg-white px-8 py-4 rounded-2xl font-medium hover:bg-primary/5 transition-all"
            >
              Learn More
            </a>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

          <div>
            <p className="font-semibold">CREWZI</p>
            <p className="text-sm text-foreground/60">
              Hospitality Hiring Platform
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy">
              Privacy Policy
            </Link>

            <Link href="/terms">
              Terms
            </Link>
          </div>

        </div>
      </footer>

    </main>
  );
}