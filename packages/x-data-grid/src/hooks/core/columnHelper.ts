import { GRID_DETAIL_PANEL_COL_DEF, GRID_GROUPING_COLUMN_COL_DEF } from '../../colDef';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '../../colDef/gridCheckboxSelectionColDef';
import { getGridDefaultColumnTypes } from '../../colDef/gridDefaultColumnTypes';
import { clamp } from '../../internals';
import {
  GRID_USER_DEFINED_SPECIAL_COLUMN,
  GridActionsColDef,
  GridBaseColDef,
  GridColDef,
  GridColDefInternal,
  GridSingleSelectColDef,
} from '../../models/colDef/gridColDef';
import { GridValidRowModel } from '../../models/gridRows';
import { GridInitialStateCommunity as GridInitialState } from '../../models/gridStateCommunity';
import { get } from '../features/columns/get';

export const defaultColDef = {
  ...getGridDefaultColumnTypes(),
  checkboxSelection: {
    ...GRID_CHECKBOX_SELECTION_COL_DEF,
    [GRID_USER_DEFINED_SPECIAL_COLUMN]: true,
  } satisfies GridColDefInternal,
  group: {
    type: GRID_GROUPING_COLUMN_COL_DEF.type,
    field: GRID_GROUPING_COLUMN_COL_DEF.field,
    [GRID_USER_DEFINED_SPECIAL_COLUMN]: true,
  } satisfies GridColDefInternal,
  detailPanel: GRID_DETAIL_PANEL_COL_DEF,
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
  group: Omit<
    GridBaseColDef<R>,
    'field' | 'aggregable' | 'editable' | 'groupable' | 'getApplyQuickFilterFn'
  >;
  detailPanel: Omit<GridBaseColDef<R>, 'field' | 'aggregable' | 'editable' | 'groupable'>;
};

type DotSeparatedKeys<T> = T extends Date
  ? never
  : T extends object
    ?
        | {
            [K in Exclude<keyof T, keyof any[]> & string]: T[K] extends object
              ? K | `${K}.${DotSeparatedKeys<T[K]>}`
              : K;
          }[Exclude<keyof T, keyof any[]> & string]
        | 'actions'
        | `custom_${string}`
        | `calc_${string}`
    : never;

type DefaultColumnType<R extends GridValidRowModel> = keyof DefaultColumnTypes<R>;

type AdditionalProps = {
  pinned?: 'left' | 'right';
  hide?: boolean;
  aggregation?: string;
};

type Field<ColDef, R extends GridValidRowModel> = 'field' extends keyof ColDef
  ? { field: DotSeparatedKeys<R> }
  : {};

// Helper type: if Field<T,R> has no keys, then it is empty.
type HasField<ColDef, R extends GridValidRowModel> = [keyof Field<ColDef, R>] extends [never]
  ? false
  : true;

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type DefaultHelper<R extends GridValidRowModel> = {
  [K in DefaultColumnType<R>]: HasField<DefaultColumnTypes<R>[K], R> extends true
    ? (
        colDef: Prettify<
          Omit<DefaultColumnTypes<R>[K], keyof DefaultColumnTypes<R>[K]> &
            AdditionalProps &
            Field<DefaultColumnTypes<R>[K], R> & { type?: GridColDef['type'] } & Partial<
              DefaultColumnTypes<R>[K]
            >
        >,
      ) => GridColDef
    : (
        colDef?: Prettify<
          Omit<DefaultColumnTypes<R>[K], keyof DefaultColumnTypes<R>[K]> &
            AdditionalProps &
            Field<DefaultColumnTypes<R>[K], R> &
            Partial<DefaultColumnTypes<R>[K]>
        >,
      ) => GridColDef;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Updated CustomHelper type to use the default type from extends if provided.
type CustomHelper<
  R extends GridValidRowModel,
  C extends Record<string, Partial<GridColDef<R>> & { extends?: DefaultColumnType<R> }>,
> = {
  [K in keyof C]: C[K] extends { extends: infer U extends DefaultColumnType<R> }
    ? (
        colDef: Prettify<
          Omit<Partial<DefaultColumnTypes<R>[U]>, 'field'> &
            AdditionalProps &
            Field<DefaultColumnTypes<R>[U], R>
        >,
      ) => GridColDef
    : (
        colDef: Prettify<
          Omit<Partial<GridColDef<R, any, any, C[K]['renderCellProps']>>, 'field'> &
            AdditionalProps &
            Field<C[K], R>
        >,
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
      callback: (
        // @ts-expect-error - Allow custom column types to extend default types.
        col: Prettify<DefaultHelper<R2> & CustomHelper<R2, C>>,
      ) => Prettify<GridColDef & AdditionalProps>[],
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

          if (
            colDef.headerName == null &&
            options.autoFillMissingHeaders &&
            !(colDef as GridColDefInternal)[GRID_USER_DEFINED_SPECIAL_COLUMN]
          ) {
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
        hideFieldsByDefault?: Array<keyof Row>;
        initialPinnedColumns?: {
          left?: Array<keyof Row>;
          right?: Array<keyof Row>;
        };
        staticTypes?: Record<keyof Row, keyof typeof helper>;
        rowSampleSize?: number;
        maxDepth?: number;
        maxColumnWidth?: number;
        defaultColumnWidth?: number;
        minColumnWidth?: number;
        shortenNestedHeaders?: boolean;
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
      const shortenNestedHeaders = options?.shortenNestedHeaders ?? true;

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

              const currentWidth = getEstimatedStringWidth(
                value != null
                  ? value instanceof Date
                    ? value.toISOString().split('T')[0]
                    : String(value)
                  : '',
              );
              const existingWidth = columnWidths.get(currentPathString);
              if (existingWidth == null || currentWidth > existingWidth) {
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
        const headerName = humanize(field, shortenNestedHeaders);
        const headerWidth = getEstimatedStringWidth(headerName) + 30;
        const baseWidth = Math.max(headerWidth, columnWidths.get(field) ?? defaultColumnWidth);
        columns.push(
          helper[type]({
            // @ts-expect-error -
            field: field as any,
            headerName,
            width: clamp(baseWidth, minColumnWidth, maxColumnWidth),
          }),
        );
      });

      return {
        columns,

        initialState: {
          ...(options?.hideFieldsByDefault && {
            columns: {
              columnVisibilityModel: Object.fromEntries(
                options.hideFieldsByDefault.map((field) => [field, false]),
              ),
            },
          }),
          ...(options?.initialPinnedColumns && {
            pinnedColumns: {
              left: options.initialPinnedColumns.left ?? [],
              right: options.initialPinnedColumns.right ?? [],
            },
          }),
        },
      };
    },
  };
}

const getEstimatedStringWidth = (str: string) => {
  return str.length * 7 + 20;
};

export const columnHelper = createColumnHelper({
  multiSelect: {
    field: 'tags',
    type: 'array',
  },
});

export const createColumns = columnHelper.createColumns;
export const inferColumns = columnHelper.inferFromData;

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
  if (str.match(/^id$/i)) {
    return 'ID';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function humanize(str: string, shortenNested?: boolean) {
  if (shortenNested && str.match(/\./)) {
    return capitalize(str.split('.').at(-1)!);
  }
  if (str.match(/\.|_/)) {
    return str.split(/\.|_/).map(capitalize).join(' ');
  }
  return capitalize(str.replace(/_ids?$/g, '').replace(/_/g, ' '));
}
