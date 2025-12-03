'use client';

import { useState, useEffect } from 'react';
import { Download, X, AlertCircle } from 'lucide-react';
import { usePlatform } from '@/src/lib/platform';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const platform = usePlatform();

  // Add debug message helper
  const addDebugMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
    console.log(`[PWA Install] ${message}`);
  };

  useEffect(() => {
    // Check if app is already installed
    if (typeof window === 'undefined') return;

    // Check if iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(checkIOS);
    addDebugMessage(`Platform: ${platform}, iOS: ${checkIOS}`);

    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(standalone);
      if (standalone) {
        addDebugMessage('App already installed');
      }
    };

    checkInstalled();

    // Check if user dismissed the prompt this session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Only show on web platform
    if (platform !== 'web') {
      return;
    }

    // For iOS, show banner immediately (no beforeinstallprompt event)
    if (checkIOS) {
      // Check if user dismissed it before showing
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (dismissed !== 'true') {
        setShowBanner(true);
      }
      return;
    }

    let fallbackTimer: NodeJS.Timeout;

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Check if user dismissed it before showing
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (dismissed === 'true') {
        addDebugMessage('Banner dismissed - ignoring install prompt');
        return;
      }
      
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowBanner(true);
      addDebugMessage('✅ Install prompt available!');
      // Clear fallback timer since we got the prompt
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Ensure service worker is registered (required for PWA install)
    const ensureServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          let registration = await navigator.serviceWorker.getRegistration();
          
          // If not registered, try to register it
          if (!registration) {
            try {
              const response = await fetch('/sw.js', { method: 'HEAD' });
              if (response.ok) {
                registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                addDebugMessage('✅ Service Worker registered');
              } else {
                addDebugMessage('⚠️ Service worker file not found');
              }
            } catch (error) {
              addDebugMessage('⚠️ Could not register service worker');
            }
          } else {
            addDebugMessage('✅ Service Worker already registered');
          }
        } catch (error) {
          console.warn('Service worker check failed:', error);
        }
      }
    };

    ensureServiceWorker();

    // Fallback: Show banner after a delay if prompt hasn't fired yet
    // This helps when the prompt event is delayed or requires user interaction
    fallbackTimer = setTimeout(() => {
      // Check if user dismissed it before showing
      const dismissed = sessionStorage.getItem('pwa-install-dismissed');
      if (dismissed === 'true') {
        addDebugMessage('Banner dismissed - not showing fallback');
        return;
      }
      
      setShowBanner((prev) => {
        // Only show if we still don't have a prompt and not installed
        if (!prev && !checkIOS && !isInstalled) {
          addDebugMessage('⚠️ Install prompt delayed - may need user interaction');
          // Check if browser supports PWA install
          const supportsPWA = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
          if (!supportsPWA) {
            addDebugMessage('⚠️ Browser may not support PWA install');
          }
          return true;
        }
        return prev;
      });
    }, 3000); // Wait 3 seconds for the prompt event
    
    // Also try to trigger prompt after user interaction
    // Some browsers only fire the event after user interaction
    const handleUserInteraction = () => {
      if (!deferredPrompt && !isInstalled && !checkIOS) {
        // Check again after interaction
        setTimeout(() => {
          if (!deferredPrompt) {
            addDebugMessage('💡 Try scrolling or clicking - prompt may appear after interaction');
          }
        }, 1000);
      }
    };
    
    // Listen for user interactions
    window.addEventListener('scroll', handleUserInteraction, { once: true });
    window.addEventListener('click', handleUserInteraction, { once: true });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [platform, isInstalled]);

  const handleInstall = async () => {
    addDebugMessage('Install button clicked');
    
    // If iOS, show instructions
    if (isIOS) {
      addDebugMessage('iOS detected - showing instructions');
      setShowInstructions(true);
      return;
    }

    // If no deferred prompt, check if we can still install
    if (!deferredPrompt) {
      addDebugMessage('⚠️ No install prompt available yet');
      // Check if browser has install capability
      const canInstall = window.matchMedia('(display-mode: standalone)').matches === false;
      if (canInstall) {
        addDebugMessage('💡 Try: Look for install icon (➕) in browser address bar');
        addDebugMessage('💡 Or: Interact with page more (scroll, click) then try again');
      }
      setShowInstructions(true);
      return;
    }

    try {
      addDebugMessage('Triggering install prompt...');
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      addDebugMessage(`User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        addDebugMessage('✅ Installation accepted!');
        setShowBanner(false);
        // Clear dismissal so they can see it again if needed
        sessionStorage.removeItem('pwa-install-dismissed');
      } else {
        addDebugMessage('User dismissed install');
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      addDebugMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // If prompt fails, show instructions
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or not web platform
  if (isInstalled || platform !== 'web') {
    return null;
  }

  // Instructions modal
  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Install App</h2>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {isIOS ? (
            // iOS Instructions
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  1
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Tap the Share button</p>
                  <p className="text-gray-600 text-sm">Look for the share icon (square with arrow) at the bottom of your screen</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  2
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Select "Add to Home Screen"</p>
                  <p className="text-gray-600 text-sm">Scroll down in the share menu to find this option</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  3
                </div>
                <div>
                  <p className="text-gray-800 font-medium">Tap "Add"</p>
                  <p className="text-gray-600 text-sm">The app will appear on your home screen!</p>
                </div>
              </div>
            </div>
          ) : (
            // Android/Desktop Instructions
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium mb-1">Look for the Install Icon</p>
                    <p className="text-green-700 text-sm">
                      Check your browser's address bar for an install icon (➕ or download icon). 
                      Click it to install the app.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Look in the address bar</p>
                    <p className="text-gray-600 text-sm">Find the install icon (➕) next to the URL</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Interact with the page</p>
                    <p className="text-gray-600 text-sm">Scroll, click, or navigate - the install option may appear after engagement</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Click Install</p>
                    <p className="text-gray-600 text-sm">The app will be added to your home screen or desktop</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-xs">
                  <strong>Note:</strong> The install prompt appears automatically when PWA requirements are met. 
                  If it doesn't appear, try refreshing the page or checking browser settings.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show banner if user dismissed it
  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transform transition-all duration-300 ease-in-out">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-start p-4 gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Install STIS-V App
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Get the full app experience with offline access
            </p>
            {!deferredPrompt && !isIOS && (
              <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Install prompt loading... Try scrolling or clicking first
              </p>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={false} // Always allow click - will show instructions if prompt not ready
                title={!deferredPrompt && !isIOS ? 'Click to see installation options' : 'Install app'}
              >
                {isIOS ? 'Show Instructions' : deferredPrompt ? 'Install Now' : 'Install'}
              </button>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                aria-label="Toggle Debug"
                title="Debug Info"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Debug Info Panel */}
            {showDebug && debugInfo.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Debug Info:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {debugInfo.map((msg, idx) => (
                    <p key={idx} className="text-xs text-gray-600 font-mono">
                      {msg}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Status: {deferredPrompt ? '✅ Ready to Install' : '⏳ Waiting for prompt...'}
                </p>
                {!deferredPrompt && !isIOS && (
                  <p className="text-xs text-amber-600 mt-1">
                    💡 Tip: Scroll or click around the page, then try installing again
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

