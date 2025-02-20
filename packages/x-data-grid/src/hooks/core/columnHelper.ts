import { GRID_CHECKBOX_SELECTION_COL_DEF } from '../../colDef/gridCheckboxSelectionColDef';
import { getGridDefaultColumnTypes } from '../../colDef/gridDefaultColumnTypes';
import {
  GridActionsColDef,
  GridBaseColDef,
  GridColDef,
  GridSingleSelectColDef,
} from '../../models/colDef/gridColDef';
import { GridValidRowModel } from '../../models/gridRows';
import { GridInitialStateCommunity as GridInitialState } from '../../models/gridStateCommunity';
import { get } from '../features/columns/get';
import { GridPinnedColumnPosition } from '../features/columns/gridColumnsInterfaces';

export const defaultColDef = {
  ...getGridDefaultColumnTypes(),
  checkboxSelection: GRID_CHECKBOX_SELECTION_COL_DEF,
};

type DefaultColumnTypes<R extends GridValidRowModel> = {
  string: GridBaseColDef<R>;
  number: GridBaseColDef<R>;
  date: GridBaseColDef<R, Date, any>;
  dateString: GridBaseColDef<R>;
  dateTime: GridBaseColDef<R>;
  boolean: GridBaseColDef<R>;
  singleSelect: GridSingleSelectColDef<R>;
  actions: GridActionsColDef<R>;
  custom: GridBaseColDef<R>;
  array: GridBaseColDef<R>;
  checkboxSelection: Omit<GridBaseColDef<R>, 'field'>;
};

type DotSeparatedKeys<T> = T extends object
  ? {
      [K in Exclude<keyof T, keyof any[]> & string]: T[K] extends object
        ? K | `${K}.${DotSeparatedKeys<T[K]>}`
        : K;
    }[Exclude<keyof T, keyof any[]> & string]
  : never;

type DefaultColumnType<R extends GridValidRowModel> = keyof DefaultColumnTypes<R>;

type AdditionalProps = {
  pinned?: GridPinnedColumnPosition;
  hide?: boolean;
  aggregation?: string;
};

type Field<ColDef, R extends GridValidRowModel> = 'field' extends keyof ColDef
  ? { field: DotSeparatedKeys<R> }
  : {};

// New helper type merging default and custom types.
type DefaultHelper<R extends GridValidRowModel> = {
  [K in DefaultColumnType<R>]: (
    colDef: Omit<Partial<DefaultColumnTypes<R>[K]>, 'field'> &
      AdditionalProps &
      Field<DefaultColumnTypes<R>[K], R>,
  ) => GridColDef;
};

// Updated CustomHelper type to use the default type from extends if provided.
type CustomHelper<
  R extends GridValidRowModel,
  C extends Record<string, Partial<GridColDef<R>> & { extends?: DefaultColumnType<R> }>,
> = {
  [K in keyof C]: C[K] extends { extends: infer U extends DefaultColumnType<R> }
    ? (
        colDef: Omit<Partial<DefaultColumnTypes<R>[U]>, 'field'> &
          AdditionalProps &
          Field<DefaultColumnTypes<R>[U], R>,
      ) => GridColDef
    : (
        colDef: Omit<Partial<GridColDef<R, any, any, C[K]['renderCellProps']>>, 'field'> &
          AdditionalProps &
          Field<C[K], R>,
      ) => GridColDef;
};

export function createColumnHelper<
  R extends GridValidRowModel,
  C extends Record<
    string,
    Partial<GridColDef<R, any, any, any>> & { extends?: DefaultColumnType<R> }
  >,
>(customColumnTypes: C = {} as C) {
  // Combine default and custom helpers.
  const helper = {} as Exclude<DefaultHelper<R>, keyof C> & CustomHelper<R, C>;

  // Build helper with a method for each default column type.
  (Object.keys(defaultColDef) as DefaultColumnType<R>[]).forEach((type) => {
    helper[type] = (colDef) => ({
      // satisfy the compiler
      field: '',
      ...defaultColDef[type],
      ...colDef,
    });
  });

  for (const type in customColumnTypes) {
    const { extends: baseType, ...customType } = customColumnTypes[type];
    helper[type as keyof DefaultColumnTypes<R>] = (colDef) => ({
      // satisfy the compiler
      field: '',
      ...(baseType && defaultColDef[baseType]),
      ...customType,
      ...colDef,
    });
  }

  return {
    // Now createColumns is generic over a new row type R2,
    // defaulting to the original R if not specified.
    createColumns: <R2 extends GridValidRowModel = R>(
      // @ts-expect-error - Allow custom column types to extend default types.
      callback: (c: DefaultHelper<R2> & CustomHelper<R2, C>) => (GridColDef & AdditionalProps)[],
      options: {
        autoFillMissingHeaders?: boolean;
      } = {
        autoFillMissingHeaders: true,
      },
    ) => {
      const initialState: GridInitialState = {
        pinnedColumns: {
          left: [],
          right: [],
        },
        aggregation: {
          model: {},
        },
        columns: {
          columnVisibilityModel: {},
        },
      };
      // @ts-expect-error - Allow custom column types to extend default types.
      const columns = callback(helper as unknown as DefaultHelper<R2> & CustomHelper<R2, C>);

      const parsedColumns: GridColDef[] = columns.map(
        ({ pinned, aggregation, hide, ...colDef }) => {
          if (pinned) {
            initialState.pinnedColumns![pinned].push(colDef.field);
          }
          if (hide) {
            initialState.columns!.columnVisibilityModel![colDef.field] = false;
          }
          if (aggregation) {
            initialState.aggregation!.model![colDef.field] = aggregation;
          }

          if (!colDef.headerName && options.autoFillMissingHeaders) {
            colDef.headerName = humanize(colDef.field);
          }

          return colDef;
        },
      );

      return {
        columns: parsedColumns,
        initialState,
      };
    },
    inferFromData: <Row extends GridValidRowModel>(
      data: Row[],
      options?: {
        skipFields?: Array<keyof Row>;
        staticTypes?: Record<keyof Row, keyof typeof helper>;
        rowSampleSize?: number;
        maxDepth?: number;
        maxColumnWidth?: number;
        defaultColumnWidth?: number;
        minColumnWidth?: number;
      },
    ) => {
      const columnNames = new Set<string>();
      const columnType = new Map<string, keyof typeof helper>();
      const columnWidths = new Map<string, number>();
      const columns: Partial<GridColDef>[] = [];
      const rowSampleSize = options?.rowSampleSize ?? 10;
      const maxDepth = options?.maxDepth ?? 3;
      const maxColumnWidth = options?.maxColumnWidth ?? 300;
      const defaultColumnWidth = options?.defaultColumnWidth ?? 100;
      const minColumnWidth = options?.minColumnWidth ?? 50;

      const traverseRow = (row: Row, path: string[] = [], depth = 1) => {
        Object.keys(row).forEach((field) => {
          if (!options?.skipFields?.includes(field as keyof Row)) {
            const currentPath = [...path, field];
            const currentPathString = currentPath.join('.');
            const value = get(row, currentPathString);

            const isPureObject =
              value &&
              typeof value === 'object' &&
              !Array.isArray(value) &&
              !(value instanceof Date);

            if (isPureObject) {
              if (depth < maxDepth) {
                traverseRow(value, currentPath, depth + 1);
              }
            } else {
              if (typeof value === 'number') {
                columnType.set(currentPathString, 'number');
              } else if (value instanceof Date) {
                columnType.set(currentPathString, 'date');
              } else if (typeof value === 'boolean') {
                columnType.set(currentPathString, 'boolean');
              } else if (Array.isArray(value)) {
                columnType.set(currentPathString, 'array');
              } else if (value && new Date(value).toString() !== 'Invalid Date') {
                columnType.set(currentPathString, 'dateString');
              }

              const currentWidth = Math.min(maxColumnWidth, String(value).length * 7);
              const existingWidth = columnWidths.get(currentPathString);
              if (
                existingWidth == null ||
                (currentWidth > existingWidth && currentWidth < maxColumnWidth)
              ) {
                columnWidths.set(currentPathString, currentWidth);
              }

              columnNames.add(currentPathString);
            }
          }
        });
      };

      data.slice(0, rowSampleSize).forEach((row) => {
        traverseRow(row, [], 1);
      });

      columnNames.forEach((field) => {
        const type = columnType.get(field) ?? ('string' as keyof typeof helper);
        columns.push(
          helper[type]({
            field: field as any,
            headerName: humanize(field),
            width: Math.max(
              minColumnWidth,
              Math.min(maxColumnWidth, columnWidths.get(field) ?? defaultColumnWidth),
            ),
          }),
        );
      });

      return columns;
    },
  };
}

export const columnHelper = createColumnHelper({
  multiSelect: {
    field: 'tags',
    type: 'array',
  },
});

type Row = {
  name: string;
  tags: string[];
  actions: string[];
  test: string[];
  person: {
    name: string;
  };
};

export function createCustomColDef<RenderCellProps = never>(
  colDef: Partial<GridColDef<any, any, any, RenderCellProps>>,
) {
  return colDef;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function humanize(str: string) {
  return capitalize(str.replace(/_ids?$/g, '').replace(/_/g, ' '));
}
