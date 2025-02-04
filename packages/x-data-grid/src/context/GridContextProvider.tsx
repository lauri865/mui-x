import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { GridApiContext } from '../components/GridApiContext';
import { GridPrivateApiContext } from '../hooks/utils/useGridPrivateApiContext';
import { GridPrivateApiCommunity } from '../models/api/gridApiCommunity';
import { GridRootPropsContext } from './GridRootPropsContext';
import { GridConfiguration } from '../models/configuration/gridConfiguration';
import { GridConfigurationContext } from '../components/GridConfigurationContext';
import { GridThemeContext } from './GridThemeContext';
import { theme } from '../theme';

type GridContextProviderProps = {
  privateApiRef: RefObject<GridPrivateApiCommunity>;
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
