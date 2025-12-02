import type { Metadata } from 'next';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { InstallPWA } from '@/src/components/layout/InstallPWA';
import '@/src/index.css';

export const metadata: Metadata = {
  title: 'STIS-V',
  description: 'Progressive Web App for STIS Conference at IISc Bangalore',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'STIS-V',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="STIS-V" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <InstallPWA />
        </AuthProvider>
      </body>
    </html>
  );
}

