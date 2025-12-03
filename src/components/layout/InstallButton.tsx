'use client';

import { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

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

    // Listen for beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
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

    // For iOS, show button after a delay (they need to use share menu)
    // For Android, the button will show when beforeinstallprompt fires
    let showButtonTimer: NodeJS.Timeout;
    
    if (checkIOS) {
      // iOS: Show button after 1 second if not installed
      showButtonTimer = setTimeout(() => {
        if (!checkInstalled()) {
          setShowButton(true);
        }
      }, 1000);
    } else {
      // Android: Show button after 3 seconds as fallback (in case event is delayed)
      showButtonTimer = setTimeout(() => {
        if (!checkInstalled() && deferredPromptRef.current) {
          setShowButton(true);
        }
      }, 3000);
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
      window.removeEventListener('focus', handleFocus);
      clearInterval(checkInterval);
      clearTimeout(showButtonTimer);
    };
  }, []);

  const handleInstall = async () => {
    // For Android/Chrome: Use the deferred prompt to show native install dialog
    if (deferredPrompt || deferredPromptRef.current) {
      const prompt = deferredPrompt || deferredPromptRef.current;
      
      if (!prompt) {
        console.log('Install prompt not ready yet. Please wait a moment and try again.');
        return;
      }

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
    } else if (isIOS) {
      // For iOS Safari, we can't programmatically trigger install
      // Show helpful instructions
      alert('To install this app:\n\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"\n\nThe app will appear on your home screen!');
    } else {
      // For other browsers, the install option should be in the browser menu
      console.log('Install prompt not available. Please check your browser menu for install option.');
    }
  };

  // Don't show if already installed
  if (isInstalled || !showButton) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 left-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-40 transition-colors font-medium text-sm md:text-base"
      aria-label="Install App"
    >
      <Download className="w-5 h-5" />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
}
