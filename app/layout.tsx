import type { Metadata } from 'next';
import { AuthProvider } from '@/src/contexts/AuthContext';
import '@/src/index.css';

export const metadata: Metadata = {
  title: 'STIS Conference PWA',
  description: 'Progressive Web App for STIS Conference at IISc Bangalore',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'STIS Conference',
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
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="STIS Conference" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

