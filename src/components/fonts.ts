import {
  JetBrains_Mono as FontMono,
  Inter as FontSans,
} from 'next/font/google';

// NextJs providers its own google font package
// @see https://nextjs.org/docs/app/building-your-application/optimizing/fonts

// Below is the recommeded way of using multiple fonts in one project
// @see https://nextjs.org/docs/app/building-your-application/optimizing/fonts#using-multiple-fonts

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});
