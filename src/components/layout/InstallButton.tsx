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
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowButton(false);
    });

    // Show button after a delay
    const showButtonTimer = setTimeout(() => {
      if (!checkInstalled()) {
        setShowButton(true);
      }
    }, checkIOS ? 1000 : 2000);

    // Re-check on focus (in case user installed while on another tab)
    const handleFocus = () => {
      checkInstalled();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
      window.removeEventListener('focus', handleFocus);
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
        await prompt.prompt();
        
        // Wait for user's response
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
          setShowButton(false);
          setIsInstalled(true);
        }
        
        // Clear the deferred prompt (can only be used once)
        setDeferredPrompt(null);
        deferredPromptRef.current = null;
      } catch (error) {
        console.error('Error showing install prompt:', error);
        setShowButton(false);
      }
    }
  };

  // Don't show if already installed
  if (isInstalled || !showButton) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 left-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 z-40 transition-all font-semibold text-sm md:text-base border-2 border-green-500/30 hover:border-green-400/50 hover:scale-105 active:scale-95"
      aria-label="Install App"
    >
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-inner">
        <img src="/orlg.png" alt="Logo" className="w-full h-full object-contain" />
      </div>
      <Download className="w-5 h-5 flex-shrink-0" />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
}
