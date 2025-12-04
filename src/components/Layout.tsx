'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Menu, X, Home, Calendar, Users, MapPin, MessageCircle, Utensils, Settings, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { InstallButton } from './layout/InstallButton';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

function BottomNavWithScrollIndicator({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const needsScrolling = scrollWidth > clientWidth;
    setCanScrollLeft(needsScrolling && scrollLeft > 0);
    setCanScrollRight(needsScrolling && scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
    };
  }, [items]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 safe-area-inset-bottom">
      <div 
        ref={scrollContainerRef}
        className={`horizontal-scroll-container scroll-fade-left scroll-fade-right flex items-center justify-around h-20 px-1 ${
          canScrollLeft ? '' : 'scrolled-to-start'
        } ${canScrollRight ? '' : 'scrolled-to-end'}`}
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center justify-center space-y-0.5 px-2 py-2 rounded-xl transition-all min-w-[55px] flex-shrink-0 ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform flex-shrink-0`} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''} text-center leading-tight`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { user, isAuthenticated, isAdmin, isVolunteer } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if app is running in standalone mode (PWA installed)
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(standalone || isInStandalone);
    };
    
    checkStandalone();
    // Re-check on resize/focus in case status changes
    window.addEventListener('resize', checkStandalone);
    window.addEventListener('focus', checkStandalone);
    
    return () => {
      window.removeEventListener('resize', checkStandalone);
      window.removeEventListener('focus', checkStandalone);
    };
  }, []);

  useEffect(() => {
    // Register service worker for PWA support
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        // Unregister all existing service workers first to clear old caches
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('🗑️ Unregistered old service worker');
        }

        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );

        // Wait a bit before registering new one
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if service worker file is accessible
        const response = await fetch('/sw.js', { 
          method: 'HEAD',
          cache: 'no-store' // Don't cache this check
        });
        if (!response.ok) {
          console.warn('⚠️ Service worker file not found');
          return;
        }

        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', { 
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        });
        
        console.log('✅ Service Worker registered successfully');
        
        // Check for updates immediately
        await registration.update();
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('🔄 New service worker activated - reloading page');
                // Reload to get new service worker
                window.location.reload();
              }
            });
          }
        });

        // Handle service worker controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service worker controller changed');
        });
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    };

    // Register immediately when page loads
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }
  }, []);


  // All navigation items for bottom nav in standalone mode
  const mainNavItems = [
    { id: '/', label: 'Home', icon: Home, path: '/' },
    { id: '/programs', label: 'Programs', icon: Calendar, path: '/programs' },
    { id: '/halls', label: 'Halls', icon: Users, path: '/halls' },
    { id: '/maps', label: 'Maps', icon: MapPin, path: '/maps' },
    { id: '/menu', label: 'Menu', icon: Coffee, path: '/menu' },
    { id: '/events', label: 'Events', icon: Utensils, path: '/events' },
    { id: '/complaints', label: 'Feedback', icon: MessageCircle, path: '/complaints' },
  ];

  // Additional items for desktop/expanded menu (none - all are in main nav now)
  const additionalNavItems: typeof mainNavItems = [];

  // Combine all nav items
  const allNavItems = [...mainNavItems, ...additionalNavItems];
  
  // Add admin if applicable
  if (isAdmin || isVolunteer) {
    allNavItems.push({ id: '/admin', label: 'Admin', icon: Settings, path: '/admin' });
  }

  // For standalone mode, use main nav items (max 5) for bottom navigation
  const bottomNavItems = isStandalone ? mainNavItems : allNavItems;
  const navItems = allNavItems;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation - Hidden in standalone mode */}
      {!isStandalone && (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  <img src="/orlg.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">STIS-V Conference</h1>
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
      )}

      {/* Main Content - Add padding bottom for standalone mode bottom nav */}
      <main className={`container mx-auto px-4 py-6 flex-1 ${isStandalone ? 'pb-24' : ''}`}>
        {children}
      </main>

      {/* User info - Adjust position in standalone mode */}
      {isAuthenticated && !isStandalone && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-40">
          {user?.name} ({user?.role})
        </div>
      )}

      {/* Bottom Navigation Bar - Only in standalone mode */}
      {isStandalone && (
        <BottomNavWithScrollIndicator items={bottomNavItems} pathname={pathname} />
      )}

      {/* Install PWA Button - Only show when not in standalone mode */}
      {!isStandalone && <InstallButton />}
    </div>
  );
};
