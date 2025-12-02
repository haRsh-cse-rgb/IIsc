'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Menu, X, Home, Calendar, Users, MapPin, MessageCircle, Utensils, Settings, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isVolunteer } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only register service worker in production or when explicitly needed
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check if service worker file exists before registering
    const registerServiceWorker = async () => {
      try {
        // First, try to unregister any existing problematic service workers
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            // Check if the registration is valid
            try {
              await registration.update();
            } catch (updateError) {
              // If update fails, unregister the problematic service worker
              console.warn('Unregistering problematic service worker:', registration.scope);
              await registration.unregister();
            }
          }
        } catch (unregisterError) {
          // Ignore errors during cleanup
        }

        // Check if the service worker file is accessible
        try {
          const response = await fetch('/sw.js', { method: 'HEAD' });
          if (!response.ok) {
            console.warn('⚠️ Service worker file not found, skipping registration');
            return;
          }
        } catch (fetchError) {
          console.warn('⚠️ Could not check service worker file, skipping registration');
          return;
        }

        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        // Silently handle all errors - service worker is optional for PWA install
        // Don't show errors to user as this is not critical
        console.warn('⚠️ Service Worker registration skipped (non-critical):', error);
      }
    };

    // Delay registration slightly to ensure page is loaded
    const timer = setTimeout(registerServiceWorker, 1000);
    return () => clearTimeout(timer);
  }, []);


  const navItems = [
    { id: '/', label: 'Home', icon: Home, path: '/' },
    { id: '/programs', label: 'Programs', icon: Calendar, path: '/programs' },
    { id: '/halls', label: 'Halls', icon: Users, path: '/halls' },
    { id: '/maps', label: 'Maps', icon: MapPin, path: '/maps' },
    { id: '/complaints', label: 'Complaints, Queries & Feedback', icon: MessageCircle, path: '/complaints' },
    { id: '/events', label: 'Events', icon: Utensils, path: '/events' },
    { id: '/menu', label: 'Menu', icon: Coffee, path: '/menu' },
  ];

  if (isAdmin || isVolunteer) {
    navItems.push({ id: '/admin', label: 'Admin', icon: Settings, path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">STIS Conference</h1>
                <p className="text-xs text-blue-100">IISc Bangalore</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-white hover:bg-blue-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'text-white hover:bg-blue-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* User info */}
      {isAuthenticated && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {user?.name} ({user?.role})
        </div>
      )}
    </div>
  );
};
