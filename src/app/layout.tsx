
import type {Metadata} from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { AppProviders } from '@/lib/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Cine-Spot',
  description: 'Your personal film and TV experience tracker.',
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Montserrat:wght@800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#E11D48" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.classList.add(theme);
                  
                  const accent = localStorage.getItem('accent-color');
                  if (accent) {
                    document.documentElement.style.setProperty('--primary', accent);
                    document.documentElement.style.setProperty('--accent', accent);
                  }
                } catch (e) {
                  console.error('Failed to apply theme from localStorage', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={cn("font-body antialiased")} suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
