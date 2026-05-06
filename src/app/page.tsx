import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Find your next{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              hospitality role
            </span>
          </h1>
          
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-10">
            Connect top hospitality businesses with skilled workers. 
            Full-time, part-time, or gig shifts — we&apos;ve got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/jobs" 
              className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md hover:shadow-lg text-lg"
            >
              Browse jobs
            </Link>
            <Link 
              href="/signup" 
              className="border-2 border-primary/30 text-foreground px-8 py-3 rounded-xl hover:border-primary/60 hover:bg-primary/5 transition-all font-medium text-lg"
            >
              Get started
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 pt-8 border-t border-primary/10">
            <p className="text-foreground/40 text-sm mb-4">Trusted by hospitality businesses & workers</p>
            <div className="flex flex-wrap gap-6 justify-center text-foreground/30 text-sm">
              <span>✓ Hotels</span>
              <span>✓ Restaurants</span>
              <span>✓ Cafes</span>
              <span>✓ Venues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features section (optional - adds credibility) */}
      <div className="bg-white/50 border-t border-primary/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">💼</div>
              <h3 className="font-semibold text-foreground mb-2">For workers</h3>
              <p className="text-foreground/50 text-sm">Find full-time, part-time, or gig shifts that fit your schedule</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="font-semibold text-foreground mb-2">For employers</h3>
              <p className="text-foreground/50 text-sm">Post jobs, review applicants, and hire quality talent quickly</p>
            </div>
            <div>
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-foreground mb-2">Fast matching</h3>
              <p className="text-foreground/50 text-sm">Streamlined application process for both sides</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}