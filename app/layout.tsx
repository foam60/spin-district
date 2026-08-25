import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://spin-district.chatgpt.site',
  ),
  title: 'Spin District — Live, slots & bonus hunts',
  description: 'Spin District : sessions casino en direct, bonus hunts, challenges et communauté.',
  openGraph: {
    title: 'Spin District — Chaque spin peut tout changer',
    description: 'Live, slots, bonus hunts et challenges avec la communauté Spin District.',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Spin District — Chaque spin peut tout changer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spin District — Chaque spin peut tout changer',
    description: 'Live, slots, bonus hunts et challenges avec la communauté Spin District.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
