import './globals.css';

import { clientEnv } from 'src/env/client';

import Footer from './components/footer';
import Header from './components/header';

import { Analytics } from '@vercel/analytics/react';

import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    template: '%s | 185 Detailers Den',
    default: '185 Detailers Den',
  },
  description:
    '185 Detailers Den is a car detailing and car wash business located in Caloocan City, Philippines.',
  keywords: ['car wash', 'detailing', 'cleaning', 'caloocan', 'car'],
  openGraph: {
    title: '185 Detailers Den',
    description:
      '185 Detailers Den is a car detailing and car wash business located in Caloocan City, Philippines.',
    url: clientEnv.NEXT_PUBLIC_SITE_URL,
    siteName: '185 Detailers Den',
    type: 'website',
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" data-theme="light">
    <body className="h-full w-full bg-black">
      <Header />
      {children}
      <Analytics />
      <Footer />
    </body>
  </html>
);

export default RootLayout;
