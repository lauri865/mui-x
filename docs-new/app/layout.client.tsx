'use client';

import { useParams } from 'next/navigation';
import { type ReactNode, useId } from 'react';
import { cn } from '@/lib/cn';

export function Body({ children }: { children: ReactNode }): React.ReactElement {
  const mode = useMode();

  return <body className={cn(mode, 'relative flex min-h-screen flex-col')}>{children}</body>;
}

export function useMode(): string | undefined {
  const { slug } = useParams();
  return Array.isArray(slug) && slug.length > 0 ? slug[0] : undefined;
}

export function TWGridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="transparent"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M20.1069 20.1088C18.7156 21.5001 16.4765 21.5001 11.9981 21.5001C7.51976 21.5001 5.28059 21.5001 3.88935 20.1088C2.49811 18.7176 2.49811 16.4784 2.49811 12.0001C2.49811 7.52172 2.49811 5.28255 3.88935 3.89131C5.28059 2.50006 7.51976 2.50006 11.9981 2.50006C16.4764 2.50006 18.7156 2.50006 20.1069 3.8913C21.4981 5.28255 21.4981 7.52172 21.4981 12.0001C21.4981 16.4784 21.4981 18.7176 20.1069 20.1088Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
        />
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.74811 2.50006V21.5001H8.24811V2.50006H9.74811Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.49811 7.25006H21.4981V8.75006H2.49811V7.25006Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.49811 15.2501H21.4981V16.7501H2.49811V15.2501Z"
            fill="white"
          />
        </g>
      </svg>
    </>
  );
}
