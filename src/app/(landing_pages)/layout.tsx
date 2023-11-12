import '../globals.css';
import Footer from 'src/components/home/footer';
import Header from 'src/components/home/header';

import { Analytics } from '@vercel/analytics/react';

import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: '185 Detailers Den',
  description:
    '185 Detailers Den is a car detailing and car wash business located in Caloocan City, Philippines.',
  keywords: ['car wash', 'detailing', 'cleaning', 'caloocan', 'car'],
  openGraph: {
    title: '185 Detailers Den',
    description:
      '185 Detailers Den is a car detailing and car wash business located in Caloocan City, Philippines.',
    url: `https://${process.env.VERCEL_URL}`,
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
