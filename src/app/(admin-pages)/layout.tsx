import './globals.css';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'src/components/theme-provider';
import { inter } from 'src/utils/fonts';
import { JotaiProvider } from 'src/utils/jotai';
import QueryProvider from 'src/utils/query-provider';

import { twJoin } from 'tailwind-merge';

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
    default: 'Admin',
  },
  description: 'Admin page of 185 Detailers Den',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" data-theme="light" suppressHydrationWarning>
    <body className={twJoin(inter.className, 'h-screen w-full font-sans antialiased')}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryProvider>
          <JotaiProvider>{children}</JotaiProvider>
        </QueryProvider>
        <Toaster />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
