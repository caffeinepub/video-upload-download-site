import { Link, useLocation } from '@tanstack/react-router';
import { Upload, Film, Video } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Library', icon: Film },
    { to: '/upload', label: 'Upload', icon: Upload },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center teal-glow-sm group-hover:teal-glow transition-all duration-200">
              <Video className="w-5 h-5 text-background" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Video<span className="text-teal">Vault</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-teal text-background shadow-teal-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '220px' }}>
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="VideoVault Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground drop-shadow-lg">
            Your Personal <span className="text-teal">Video Vault</span>
          </h1>
          <p className="mt-2 text-muted-foreground text-sm md:text-base max-w-md">
            Upload, store, and download your videos — all in one place.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-teal" />
            <span className="font-display font-semibold text-foreground">VideoVault</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-1">
            Built with{' '}
            <span className="text-teal mx-1">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'videovault')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-teal-light transition-colors font-medium ml-1"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
