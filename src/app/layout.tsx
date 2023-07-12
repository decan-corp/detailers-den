import './globals.css';
import { Inter } from 'next/font/google';

import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '185 Detailers Den',
  description:
    '185 Detailers Den is a car detailing and car wash business located in Caloocan City, Philippines.',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className={inter.className}>{children}</body>
  </html>
);

export default RootLayout;
