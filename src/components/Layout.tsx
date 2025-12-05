'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Home, Calendar, Users, MapPin, MessageCircle, Utensils, Settings, Coffee, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const { user, isAuthenticated, isAdmin, isVolunteer } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if app is running in standalone mode (PWA installed)
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandalone = (window.navigator as any).standalone === true;
      const installed = standalone || isInStandalone;
      
      if (installed) {
        setIsStandalone(true);
        setShowInstallButton(false);
      } else {
        setIsStandalone(false);
      }
      
      return installed;
    };
    
    // Check immediately
    const isInstalled = checkStandalone();
    
    // If already installed, don't set up install button logic
    if (isInstalled) {
      return;
    }
    
    // Re-check on resize/focus in case status changes
    window.addEventListener('resize', checkStandalone);
    window.addEventListener('focus', checkStandalone);
    
    return () => {
      window.removeEventListener('resize', checkStandalone);
      window.removeEventListener('focus', checkStandalone);
    };
  }, []);

  // Setup install button logic
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Double-check if app is already installed before setting up install logic
    const checkIfInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandalone = (window.navigator as any).standalone === true;
      return standalone || isInStandalone;
    };

    // If already installed, don't set up install button
    if (checkIfInstalled() || isStandalone) {
      setShowInstallButton(false);
      return;
    }

    // Check if iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(checkIOS);

    // Listen for beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Check again if installed before showing button
      if (checkIfInstalled()) {
        setShowInstallButton(false);
        setIsStandalone(true);
        return;
      }
      
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      deferredPromptRef.current = promptEvent;
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      setIsStandalone(true);
    });

    // Show button after a delay (for iOS or if prompt doesn't fire)
    // But check again if installed before showing
    const showButtonTimer = setTimeout(() => {
      if (!checkIfInstalled() && !isStandalone) {
        setShowInstallButton(true);
      }
    }, checkIOS ? 1000 : 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
      clearTimeout(showButtonTimer);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    // For iOS Safari, show instructions
    if (isIOS) {
      alert('To install this app:\n\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"\n\nThe app will appear on your home screen!');
      return;
    }

    // For Android/Chrome: Use the deferred prompt to show native install dialog
    const prompt = deferredPrompt || deferredPromptRef.current;
    
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
          setShowInstallButton(false);
          setIsStandalone(true);
        }
        
        setDeferredPrompt(null);
        deferredPromptRef.current = null;
      } catch (error) {
        console.error('Error showing install prompt:', error);
        setShowInstallButton(false);
      }
    }
  };

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
      {/* Top Navigation - Hidden in standalone mode, simplified header on mobile */}
      {!isStandalone && (
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  <img src="/orlg.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">STIS-V</h1>
                  <p className="text-xs text-blue-100">IISc Bangalore</p>
                </div>
              </div>

              {/* Desktop Navigation - Hidden on mobile (using bottom nav instead) */}
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

              {/* Install App Button - Where hamburger menu was */}
              {!isStandalone && showInstallButton && (
                <button
                  onClick={handleInstall}
                  className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors flex items-center space-x-2 text-white font-medium shadow-md"
                  aria-label="Install App"
                  title="Install App"
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Install App</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content - Add padding bottom for bottom nav on mobile and standalone mode */}
      <main className={`container mx-auto px-4 py-6 flex-1 ${isStandalone ? 'pb-24' : 'md:pb-6 pb-24'}`}>
        {children}
      </main>

      {/* User info - Adjust position to avoid bottom nav */}
      {isAuthenticated && !isStandalone && (
        <div className="hidden md:block fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-40">
          {user?.name} ({user?.role})
        </div>
      )}

      {/* Bottom Navigation Bar - Show on mobile screens OR in standalone mode */}
      <div className={isStandalone ? '' : 'md:hidden'}>
        <BottomNavWithScrollIndicator items={bottomNavItems} pathname={pathname} />
      </div>
    </div>
  );
};
