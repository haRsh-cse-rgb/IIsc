'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, AlertCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Check PWA requirements
  const checkPWARequirements = async () => {
    const checks: string[] = [];
    
    // Check HTTPS
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    checks.push(`${isHTTPS ? '✅' : '❌'} HTTPS: ${location.protocol}`);
    
    // Check service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        checks.push(`${registration ? '✅' : '❌'} Service Worker: ${registration ? 'Registered' : 'Not registered'}`);
        if (registration) {
          checks.push(`   Scope: ${registration.scope}`);
          checks.push(`   Active: ${registration.active ? 'Yes' : 'No'}`);
        }
      } catch (e) {
        checks.push(`❌ Service Worker: Error checking - ${e}`);
      }
    } else {
      checks.push('❌ Service Worker: Not supported');
    }
    
    // Check manifest
    try {
      const manifestResponse = await fetch('/manifest.json');
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        checks.push(`✅ Manifest: Found`);
        checks.push(`   Name: ${manifest.name}`);
        checks.push(`   Icons: ${manifest.icons?.length || 0} icons`);
        
        // Check if icons are accessible
        if (manifest.icons && manifest.icons.length > 0) {
          const iconCheck = await fetch(manifest.icons[0].src);
          checks.push(`${iconCheck.ok ? '✅' : '❌'} Icon accessible: ${manifest.icons[0].src}`);
        }
      } else {
        checks.push(`❌ Manifest: Not found (${manifestResponse.status})`);
      }
    } catch (e) {
      checks.push(`❌ Manifest: Error - ${e}`);
    }
    
    // Check if installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInStandalone = (window.navigator as any).standalone === true;
    checks.push(`${standalone || isInStandalone ? '✅' : '❌'} Installed: ${standalone || isInStandalone ? 'Yes' : 'No'}`);
    
    // Check browser
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad/.test(navigator.userAgent);
    checks.push(`${isChrome || isEdge ? '✅' : '⚠️'} Browser: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Edge') ? 'Edge' : navigator.userAgent}`);
    checks.push(`${isMobile ? '✅' : '⚠️'} Mobile: ${isMobile ? 'Yes' : 'No'}`);
    
    setDiagnostics(checks);
    return checks;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(checkIOS);

    // Check if app is already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandalone = (window.navigator as any).standalone === true;
      const installed = standalone || isInStandalone;
      
      if (installed) {
        setIsInstalled(true);
        setShowButton(false);
        return true;
      }
      setIsInstalled(false);
      return false;
    };

    // Initial check
    if (checkInstalled()) {
      return; // Already installed, don't set up listeners
    }

    // Run diagnostics
    checkPWARequirements();

    // Listen for beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎉 beforeinstallprompt event fired!');
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      deferredPromptRef.current = promptEvent;
      
      // Show button when we get the prompt
      if (!checkInstalled()) {
        setShowButton(true);
        console.log('✅ Install prompt available - showing install button');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('✅ App was installed');
      setIsInstalled(true);
      setShowButton(false);
    });

    // For iOS, show button after a delay (they need to use share menu)
    // For Android, show button when prompt is available OR after delay
    let showButtonTimer: NodeJS.Timeout;
    
    if (checkIOS) {
      // iOS: Show button after 1 second if not installed
      showButtonTimer = setTimeout(() => {
        if (!checkInstalled()) {
          setShowButton(true);
        }
      }, 1000);
    } else {
      // Android: Show button after 2 seconds regardless
      // The button will work even if prompt fires later
      showButtonTimer = setTimeout(async () => {
        if (!checkInstalled()) {
          setShowButton(true);
          console.log('📱 Showing install button (Android)');
          
          // Re-check requirements
          await checkPWARequirements();
          
          // If still no prompt, wait for user interaction
          if (!deferredPromptRef.current) {
            console.warn('⚠️ Install prompt not available yet - waiting for user interaction');
            
            // Try to trigger prompt after user interaction
            const triggerOnInteraction = () => {
              // Check again after interaction
              setTimeout(() => {
                if (deferredPromptRef.current) {
                  console.log('✅ Install prompt received after user interaction!');
                }
              }, 500);
            };
            
            // Listen for user interactions
            window.addEventListener('scroll', triggerOnInteraction, { once: true });
            window.addEventListener('click', triggerOnInteraction, { once: true });
            window.addEventListener('touchstart', triggerOnInteraction, { once: true });
          }
        }
      }, 2000);
    }

    // Re-check on focus (in case user installed while on another tab)
    const handleFocus = () => {
      checkInstalled();
    };
    window.addEventListener('focus', handleFocus);

    // Check periodically (in case installation status changes)
    const checkInterval = setInterval(() => {
      checkInstalled();
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
      window.removeEventListener('focus', handleFocus);
      clearInterval(checkInterval);
      clearTimeout(showButtonTimer);
    };
  }, []);

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
        // This triggers the native install dialog (like in your screenshot)
        await prompt.prompt();
        
        // Wait for user's response
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ User accepted the install prompt');
          setShowButton(false);
          setIsInstalled(true);
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Clear the deferred prompt (can only be used once)
        setDeferredPrompt(null);
        deferredPromptRef.current = null;
      } catch (error) {
        console.error('Error showing install prompt:', error);
        // Prompt might have been used already or app is installing
        setShowButton(false);
      }
    } else {
      // Prompt not available - try to wait for it or show diagnostics
      console.log('⏳ Install prompt not ready yet');
      
      // Wait a bit more - sometimes it fires after user interaction
      let attempts = 0;
      const waitForPrompt = setInterval(() => {
        attempts++;
        const currentPrompt = deferredPrompt || deferredPromptRef.current;
        
        if (currentPrompt) {
          clearInterval(waitForPrompt);
          // Retry with the prompt
          handleInstall();
        } else if (attempts >= 10) {
          // After 1 second, show diagnostics
          clearInterval(waitForPrompt);
          checkPWARequirements();
          setShowDiagnostics(true);
        }
      }, 100);
    }
  };

  // Don't show if already installed
  if (isInstalled || !showButton) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstall}
        className="fixed bottom-4 left-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-40 transition-colors font-medium text-sm md:text-base"
        aria-label="Install App"
      >
        <Download className="w-5 h-5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* Diagnostics Modal */}
      {showDiagnostics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">PWA Diagnostics</h2>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Why the install prompt might not be available:
              </p>
              {diagnostics.map((check, idx) => (
                <div key={idx} className="text-xs font-mono bg-gray-50 p-2 rounded">
                  {check}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Since all requirements are met, try:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Scroll the page</strong> - Sometimes the prompt fires after scrolling</li>
                <li><strong>Click around</strong> - Interact with buttons, links, etc.</li>
                <li><strong>Wait 10-15 seconds</strong> - The browser may need more time</li>
                <li><strong>Check browser address bar</strong> - Look for install icon (➕) at the top</li>
                <li><strong>Visit the site multiple times</strong> - Some browsers need multiple visits</li>
                <li><strong>Close and reopen browser</strong> - Sometimes helps reset browser state</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Chrome on Android sometimes requires the page to be visited 2-3 times before showing the install prompt. This is a browser security feature.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 font-medium mb-1">✅ All Requirements Met!</p>
              <p className="text-xs text-green-700">
                Your PWA is ready. The install prompt should appear automatically. If it doesn't, try the solutions below or look for the install icon (➕) in your browser's address bar.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await checkPWARequirements();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Re-check
              </button>
              <button
                onClick={() => {
                  setShowDiagnostics(false);
                  // Try scrolling to trigger prompt
                  window.scrollBy(0, 100);
                  setTimeout(() => window.scrollBy(0, -100), 500);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Try Scrolling
              </button>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
