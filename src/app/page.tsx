import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">

      {/* HERO SECTION */}
      <section className="relative">

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            🚀 Hospitality Hiring Platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
            The fastest way to
            <br />
            staff{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            your business
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto mb-10 leading-relaxed">
            CREWZI helps hotels, restaurants, cafes, and event businesses
            connect with reliable local workers quickly and efficiently.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">

            <Link
              href="/signup"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:scale-[1.02] transition-all"
            >
              Get Started
            </Link>

            <Link
              href="/jobs"
              className="border border-primary/20 bg-white/70 backdrop-blur text-foreground px-8 py-4 rounded-2xl font-medium text-lg hover:bg-primary/5 transition-all"
            >
              Explore Jobs
            </Link>

          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="text-3xl font-bold text-foreground">50+</p>
              <p className="text-sm text-foreground/50 mt-1">Hospitality Jobs</p>
            </div>

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="text-3xl font-bold text-foreground">10+</p>
              <p className="text-sm text-foreground/50 mt-1">Local Businesses</p>
            </div>

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="text-3xl font-bold text-foreground">24h</p>
              <p className="text-sm text-foreground/50 mt-1">Average Hiring Time</p>
            </div>

            <div className="bg-white/70 backdrop-blur border border-primary/10 rounded-2xl p-5">
              <p className="text-3xl font-bold text-foreground">100%</p>
              <p className="text-sm text-foreground/50 mt-1">Mobile Friendly</p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 border-t border-primary/10 bg-white/40">
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

            {/* Employers */}
            <div className="bg-white rounded-3xl border border-primary/10 shadow-sm p-8">
              <div className="text-4xl mb-5">🏢</div>

              <h3 className="text-2xl font-semibold mb-6">
                For Employers
              </h3>

              <div className="space-y-4 text-foreground/70">

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <p>Create your company profile</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <p>Post hospitality job openings</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <p>Review applicants instantly</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <p>Hire reliable staff quickly</p>
                </div>

              </div>
            </div>

            {/* Workers */}
            <div className="bg-white rounded-3xl border border-primary/10 shadow-sm p-8">
              <div className="text-4xl mb-5">💼</div>

              <h3 className="text-2xl font-semibold mb-6">
                For Workers
              </h3>

              <div className="space-y-4 text-foreground/70">

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <p>Create your worker profile</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <p>Browse local hospitality jobs</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <p>Apply instantly with one click</p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <p>Track application status live</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* JOB CATEGORIES */}
      <section className="py-24">
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
              '🧹 Housekeeping',
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

      {/* FINAL CTA */}
      <section className="py-24 border-t border-primary/10 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start hiring faster with CREWZI
          </h2>

          <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto">
            Join the growing hospitality hiring network built for modern staffing needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              href="/signup"
              className="bg-primary text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:scale-[1.02] transition-all"
            >
              Post a Job
            </Link>

            <Link
              href="/jobs"
              className="border border-primary/20 bg-white px-8 py-4 rounded-2xl font-medium hover:bg-primary/5 transition-all"
            >
              Find Jobs
            </Link>

          </div>
        </div>
      </section>

    </main>
  );
}