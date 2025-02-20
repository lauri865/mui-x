import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { baseUrl, createMetadata } from '@/lib/metadata';
import { Body } from '@/app/layout.client';
import './global.css';
import { Provider } from './provider';

export const metadata = createMetadata({
  title: {
    template: '%s | TWGrid',
    default: 'TWGrid',
  },
  description: 'Performant tailwind-first data grid for React',
  metadataBase: baseUrl,
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: light)', color: '#fff' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <Body>
        <Provider>
          {children}
          {/* <AISearchTrigger
            className={cn(
              buttonVariants({
                variant: 'secondary',
              }),
              'fixed bottom-4 right-4 z-10 gap-2 rounded-xl bg-secondary/50 text-fd-secondary-foreground/80 shadow-lg backdrop-blur-lg md:bottom-8 md:right-8',
            )}
          >
            <MessageCircle className="size-4" />
            Ask AI
          </AISearchTrigger> */}
        </Provider>
      </Body>
    </html>
  );
}
