import * as React from 'react';
import { GRID_DEFAULT_LOCALE_TEXT } from '../constants';
import { DATA_GRID_PROPS_DEFAULT_VALUES } from '../constants/dataGridPropsDefaultValues';
import { DATA_GRID_DEFAULT_SLOTS_COMPONENTS } from '../constants/defaultGridSlotsComponents';
import { computeSlots } from '../internals/utils';
import { GridSlotsComponent, GridValidRowModel } from '../models';
import {
  DataGridForcedPropsKey,
  DataGridProcessedProps,
  DataGridProps,
  DataGridPropsWithDefaultValues,
} from '../models/props/DataGridProps';

const DATA_GRID_FORCED_PROPS: { [key in DataGridForcedPropsKey]?: DataGridProcessedProps[key] } = {
  /* disableMultipleColumnsFiltering: true,
  disableMultipleColumnsSorting: true,
  throttleRowsMs: undefined,
  hideFooterRowCount: false,
  pagination: true,
  checkboxSelectionVisibleOnly: false,
  disableColumnReorder: true,
  keepColumnPositionIfDraggedOutside: false,
  unstable_listView: false, */
  signature: 'DataGridPremium',
};

const defaultSlots = DATA_GRID_DEFAULT_SLOTS_COMPONENTS;

export const useDataGridProps = <R extends GridValidRowModel>(inProps: DataGridProps<R>) => {
  const themedProps = inProps; /* 
    // eslint-disable-next-line material-ui/mui-name-matches-component-name
    useThemeProps({
      props: inProps,
      name: 'twg',
    }); */

  const localeText = React.useMemo(
    () => ({ ...GRID_DEFAULT_LOCALE_TEXT, ...themedProps.localeText }),
    [themedProps.localeText],
  );

  const slots = React.useMemo<GridSlotsComponent>(
    () =>
      computeSlots<GridSlotsComponent>({
        defaultSlots,
        slots: themedProps.slots,
      }),
    [themedProps.slots],
  );

  const injectDefaultProps = React.useMemo(() => {
    return (
      Object.keys(DATA_GRID_PROPS_DEFAULT_VALUES) as Array<
        keyof DataGridPropsWithDefaultValues<any>
      >
    ).reduce((acc, key) => {
      // @ts-ignore
      acc[key] = themedProps[key] ?? DATA_GRID_PROPS_DEFAULT_VALUES[key];
      return acc;
    }, {} as DataGridPropsWithDefaultValues<any>);
  }, [themedProps]);

  return React.useMemo<DataGridProcessedProps<R>>(
    () => ({
      ...themedProps,
      ...injectDefaultProps,
      localeText,
      slots,
      ...DATA_GRID_FORCED_PROPS,
      // @ts-ignore
      ...(themedProps.unstable_dataSource
        ? {
            filterMode: 'server',
            sortingMode: 'server',
            paginationMode: 'server',
          }
        : {}),
    }),
    [themedProps, localeText, slots, injectDefaultProps],
  );
};
