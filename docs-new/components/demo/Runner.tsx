'use client';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { useDemoContext } from './DemoContext';

export const Runner = (props: { children: React.ReactNode }) => {
  const { editedCode } = useDemoContext();
  const hasEditedCode = Boolean(editedCode);

  const LazyRunner = React.useMemo(() => {
    return editedCode
      ? dynamic(() => import('./LazyRunner').then((m) => m.LazyRunner), {
          ssr: false,
          loading: () => <>{props.children}</>,
        })
      : null;
  }, [hasEditedCode]);
  if (!editedCode || !LazyRunner) {
    return <div>{props.children}</div>;
  }

  return <LazyRunner fallback={props.children} />;
};

const useKeepMinHeight = () => {
  const { editedCode } = useDemoContext();
  const hasEditedCode = Boolean(editedCode);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const minHeightRef = React.useRef<number>(undefined);

  React.useEffect(() => {
    if (hasEditedCode || !containerRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      minHeightRef.current = entries[0].contentRect.height;
    });
    observer.observe(containerRef.current!);

    return () => {
      observer.disconnect();
    };
  }, [hasEditedCode]);

  return { containerRef, minHeight: minHeightRef.current };
};
