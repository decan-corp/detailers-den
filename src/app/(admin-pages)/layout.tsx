import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'src/components/theme-provider';
import { inter } from 'src/utils/fonts';
import QueryProvider from 'src/utils/query-provider';

import { twJoin } from 'tailwind-merge';

import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    template: '%s | 185 Detailers Den',
    default: '185 Detailers Den',
  },
  description: 'Admin page of 185 Detailers Den',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html className="bg-background" lang="en" data-theme="light" suppressHydrationWarning>
    <body className={twJoin('h-screen w-full font-sans antialiased', inter.variable)}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
