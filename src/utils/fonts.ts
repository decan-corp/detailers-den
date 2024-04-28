import { Bebas_Neue, Cabin, Noto_Sans, Inter } from 'next/font/google';

export const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-sans',
});

export const bebasNeue = Bebas_Neue({
  weight: ['400'],
  display: 'swap',
  subsets: ['latin'],
});

export const cabin = Cabin({
  weight: ['400', '700'],
  display: 'swap',
  subsets: ['latin'],
});

export const notoSans = Noto_Sans({
  weight: ['400', '700'],
  display: 'swap',
  subsets: ['latin'],
});
