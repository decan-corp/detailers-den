import Header from 'src/components/common/header';
import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '185 Detailers Den',
  description:
    '185 Detailers Den is a car detailing and car wash business located in Caloocan City, Philippines.',
  keywords: ['car wash', 'detailing', 'cleaning', 'caloocan', 'car'],
  openGraph: {
    title: '185 Detailers Den',
    description:
      '185 Detailers Den is a car detailing and car wash business located in Caloocan City, Philippines.',
    url: process.env.VERCEL_URL,
    siteName: '185 Detailers Den',
    type: 'website',
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className="h-full w-full">
      <Header />
      {children}
    </body>
  </html>
);

export default RootLayout;
