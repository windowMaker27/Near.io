import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import '@/app/globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Near.io — Commerce près de chez vous',
  description:
    'Découvrez les commerces, restaurants et services autour de vous en temps réel.',
  manifest: '/manifest.json',
  themeColor: '#0a0a0a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
