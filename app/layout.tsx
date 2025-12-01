import type { Metadata } from 'next';
import { AuthProvider } from '@/src/contexts/AuthContext';
import '@/src/index.css';

export const metadata: Metadata = {
  title: 'STIS Conference PWA',
  description: 'Progressive Web App for STIS Conference at IISc Bangalore',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

