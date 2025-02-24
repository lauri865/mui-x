'use client';
import * as React from 'react';
import { TabValue } from '../TabValue';

export interface DemoContextValue {
  key: string;
  reset: () => void;
  activeTabRef: React.RefObject<TabValue>;
  code: Record<TabValue | 'fileName', string>;
  preview: Record<TabValue, string | null>;
  editedCode: string | null;
  setEditedCode: React.Dispatch<React.SetStateAction<string | null>>;
  codeSandboxIds: {
    [key in TabValue]: string;
  };
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  hasPreview: boolean;
  isPreview: boolean;
  tabInitialCode: string;
  toolbarId: string;
}

export const DemoContext = React.createContext<DemoContextValue>(null!);

export const useDemoContext = () => React.use(DemoContext);
