'use client';
import * as React from 'react';
import { TabValue } from '../TabValue';

export interface DemoContextValue {
  key: string;
  reset: () => void;
  activeTabRef: React.RefObject<TabValue>;
  code: Record<TabValue | 'fileName', string>;
  editedCode: string | null;
  setEditedCode: React.Dispatch<React.SetStateAction<string | null>>;
  codeSandboxIds: {
    [key in TabValue]: string;
  };
}

export const DemoContext = React.createContext<DemoContextValue>(null!);

export const useDemoContext = () => React.use(DemoContext);
