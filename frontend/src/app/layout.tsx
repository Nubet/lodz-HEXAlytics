import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HexaLytics Lodz',
  description: 'Interaktywna mapa zdarzen drogowych w Lodzi.',
};

const themeScript = `
(() => {
  const key = 'hexa-lytics-theme';
  const stored = window.localStorage.getItem(key);
  const theme = stored === 'dark' || stored === 'light'
    ? stored
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
