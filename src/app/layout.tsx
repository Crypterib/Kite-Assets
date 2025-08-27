import type {Metadata} from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Kite Assets',
  description: 'Asset management made easy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/kite-favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon-192x192.png" />

        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
