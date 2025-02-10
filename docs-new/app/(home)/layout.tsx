import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions, logo } from '@/app/layout.config';
import Link from 'next/link';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions} className="dark:bg-neutral-950">
      {children}
      <Footer />
    </HomeLayout>
  );
}

function Footer() {
  return (
    <footer className="mt-0 pb-12 opacity-50 text-fd-secondary-foreground">
      <div className="container flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-center text-center">
        <Link href="/" className="border bg-fd-card py-2 rounded-full px-12">
          {baseOptions.nav?.title}
        </Link>
      </div>
    </footer>
  );
}
