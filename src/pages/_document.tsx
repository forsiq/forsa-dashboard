import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="description" content="ZoneVast Auction Management Platform" />
      </Head>
      <body className="antialiased bg-obsidian-outer text-zinc-text selection:bg-brand/30 selection:text-brand">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
