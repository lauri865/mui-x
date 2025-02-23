'use client';
import { DataGrid } from '@mui/x-data-grid';
import * as React from 'react';
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
export const Runner = (props: { children: React.ReactNode }) => {
  const { editedCode } = useDemoContext();
  if (!editedCode) {
    return props.children;
  }

  return <DynamicRunner fallback={props.children} />;
};

function DynamicRunner({ fallback }: { fallback: React.ReactNode }) {
  const { editedCode, reset } = useDemoContext();
  const defferedCode = React.useDeferredValue(editedCode);
  const { element, error } = useRunner({
    code: defferedCode!,
    scope,
  });

  return (
    <div className="relative @container">
      {error && (
        <div className="absolute -bottom-11.5 pl-2 left-1/2 -translate-x-1/2 flex gap-2 items-center @max-xl:-right-3 @max-xl:translate-x-0 @max-xl:left-auto text-[12px] leading-none  z-10 bg-red-400/50 rounded-md shadow-md whitespace-nowrap backdrop-blur-sm text-fd-foreground">
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
        </div>
      )}
      {element || fallback}
    </div>
  );
}
