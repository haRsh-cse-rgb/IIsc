import type { Metadata } from 'next';
import { AuthProvider } from '@/src/contexts/AuthContext';
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
    icon: [
      { url: '/orlg.png', sizes: '192x192', type: 'image/png' },
      { url: '/orlg.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/orlg.png', sizes: '192x192', type: 'image/png' },
      { url: '/orlg.png', sizes: '512x512', type: 'image/png' },
    ],
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
        <link rel="icon" href="/orlg.png" type="image/png" />
        <link rel="apple-touch-icon" href="/orlg.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/orlg.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/orlg.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="STIS-V" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

