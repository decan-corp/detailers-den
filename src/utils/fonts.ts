import { Bebas_Neue, Cabin, Noto_Sans } from 'next/font/google';

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
