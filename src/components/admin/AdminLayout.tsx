import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { UserNav } from './UserNav';
import { ErrorBoundary } from './ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Pages that should use full width without container
  const isFullWidthPage = location.pathname === '/admin/tasks';

  // Show loader while checking authentication
  if (loading) {
    return <KingdomLoader fullscreen />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 border-b flex items-center justify-between px-4 md:px-8 bg-background/60 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              KINGDOM OS
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>
        {isFullWidthPage ? (
          <main className="flex-1 overflow-auto relative">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        ) : (
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
