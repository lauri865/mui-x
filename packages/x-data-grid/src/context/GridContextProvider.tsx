import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridApiContext } from '../components/GridApiContext';
import { GridConfigurationContext } from '../components/GridConfigurationContext';
import { GridPrivateApiContext } from '../hooks/utils/useGridPrivateApiContext';
import { GridPrivateApi } from '../models/api/gridApiCommunity';
import { GridConfiguration } from '../models/configuration/gridConfiguration';
import { theme } from '../theme';
import { GridRootPropsContext } from './GridRootPropsContext';
import { GridThemeContext } from './GridThemeContext';

type GridContextProviderProps = {
  privateApiRef: RefObject<GridPrivateApi>;
  configuration: GridConfiguration;
  props: {};
  children: React.ReactNode;
};

export function GridContextProvider({
  privateApiRef,
  configuration,
  props,
  children,
}: GridContextProviderProps) {
  const apiRef = React.useRef(privateApiRef.current.getPublicApi());

  return (
    <GridThemeContext.Provider value={theme}>
      <GridConfigurationContext.Provider value={configuration}>
        <GridRootPropsContext.Provider value={props}>
          <GridPrivateApiContext.Provider value={privateApiRef}>
            <GridApiContext.Provider value={apiRef}>{children}</GridApiContext.Provider>
          </GridPrivateApiContext.Provider>
        </GridRootPropsContext.Provider>
      </GridConfigurationContext.Provider>
    </GridThemeContext.Provider>
  );
}
