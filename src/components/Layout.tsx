'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Menu, X, Home, Calendar, Users, MapPin, MessageCircle, Utensils, Settings, Coffee, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { user, isAuthenticated, isAdmin, isVolunteer } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker immediately, don't wait for load
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('SW registered:', registration);
          // Check for updates
          registration.update();
        })
        .catch(error => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isStandalone) {
      setShowInstallButton(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install button on all devices when prompt is available
      setShowInstallButton(true);
      console.log('Install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show install button immediately (no beforeinstallprompt on iOS)
    if (isIOS && !isStandalone) {
      setShowInstallButton(true);
    } else {
      // For Android/Desktop: Show button after a short delay
      // This gives time for beforeinstallprompt to fire, but shows button even if it doesn't
      const timer = setTimeout(() => {
        setShowInstallButton(true);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Desktop: Show native install prompt (one-click install!)
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('App installed successfully!');
        }
        
        setDeferredPrompt(null);
        setShowInstallButton(false);
      } catch (error) {
        console.error('Install prompt error:', error);
      }
    } else {
      // iOS Safari: Show visual instructions modal
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        setShowIOSModal(true);
      } else {
        // Fallback for other browsers
        setShowIOSModal(true);
      }
    }
  };

  const navItems = [
    { id: '/', label: 'Home', icon: Home, path: '/' },
    { id: '/programs', label: 'Programs', icon: Calendar, path: '/programs' },
    { id: '/halls', label: 'Halls', icon: Users, path: '/halls' },
    { id: '/maps', label: 'Maps', icon: MapPin, path: '/maps' },
    { id: '/complaints', label: 'Feedback', icon: MessageCircle, path: '/complaints' },
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

      {/* Download as App Button - Visible on all devices */}
      {showInstallButton && (
        <>
          {/* Mobile: Full width button at bottom */}
          <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 font-medium hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>Download as App</span>
            </button>
          </div>

          {/* Desktop/Tablet: Fixed button in corner */}
          <div className="hidden md:block fixed bottom-4 right-4 z-50">
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 font-medium hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>Install App</span>
            </button>
          </div>
        </>
      )}

      {/* User info - hidden on mobile when install button is shown, shown on desktop */}
      {isAuthenticated && (
        <div className={`fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm ${
          showInstallButton ? 'hidden md:block' : 'block'
        }`}>
          {user?.name} ({user?.role})
        </div>
      )}

      {/* iOS Install Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Install App</h2>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Tap the Share button</p>
                  <p className="text-gray-600 text-sm">Look for the share icon at the bottom of your screen</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Select "Add to Home Screen"</p>
                  <p className="text-gray-600 text-sm">Scroll down in the share menu to find this option</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  3
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Tap "Add"</p>
                  <p className="text-gray-600 text-sm">The app will appear on your home screen!</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
