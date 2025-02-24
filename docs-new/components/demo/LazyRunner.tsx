'use client';
import { DataGrid } from '@mui/x-data-grid';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRunner } from 'react-runner';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import { useDemoContext } from './DemoContext';

const scope = {
  import: {
    react: React,
    '@mui/x-data-grid': { DataGrid },
  },
};

export function LazyRunner({
  fallback,
  minHeight,
}: {
  fallback: React.ReactNode;
  minHeight?: number;
}) {
  const { editedCode, reset, isPreview, tabInitialCode, preview, activeTabRef, toolbarId } =
    useDemoContext();
  const defferedCode = React.useDeferredValue(editedCode!);
  const parsedCode = React.useMemo(() => {
    return isPreview
      ? tabInitialCode.replace(preview[activeTabRef.current]!, defferedCode)
      : defferedCode;
  }, [defferedCode, isPreview, tabInitialCode]);

  const { element, error } = useRunner({
    code: parsedCode,
    scope,
  });

  React.useLayoutEffect(() => {
    document.dispatchEvent(new CustomEvent('runnerRender'));
  });

  return (
    <div
      className="relative @container flex flex-col justify-center min-h-[100px]"
      style={{
        minHeight,
      }}
    >
      {error &&
        createPortal(
          <div className="absolute top-1 pl-2 left-1/2 -translate-x-1/2 flex gap-2 items-center @max-xl:-right-3 @max-xl:translate-x-0 @max-xl:left-auto text-[12px] leading-none  z-10 bg-red-400/50 rounded-md shadow-md whitespace-nowrap backdrop-blur-sm text-fd-foreground">
            {error}
            <button
              className={cn(
                buttonVariants({
                  size: 'xs',
                  variant: 'ghost',
                }),
                'rounded-l-none bg-red-900/10 border-l h-6 border-l-red-900/10 hover:bg-red-950/30',
              )}
              onClick={reset}
            >
              Reset
            </button>
          </div>,
          document.getElementById(toolbarId) as HTMLElement,
        )}
      {element || fallback}
    </div>
  );
}
