'use client';

import { useState, useEffect } from 'react';

export type Platform = 'web' | 'pwa' | 'native';

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if running as PWA (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setPlatform('pwa');
      return;
    }

    // Check if running as native app (Capacitor)
    // @ts-ignore - Capacitor may not be available
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      setPlatform('native');
      return;
    }

    // Default to web
    setPlatform('web');
  }, []);

  return platform;
}

