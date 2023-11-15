import '../globals.css';

import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export const metadata: Metadata = {
  title: {
    template: '%s | 185 Detailers Den',
    default: '185 Detailers Den',
  },
  description: 'Admin page of 185 Detailers Den',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" data-theme="light">
    <body className="h-full w-full bg-black">{children}</body>
  </html>
);

export default RootLayout;
