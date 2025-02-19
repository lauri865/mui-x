import { GridInitialState } from '../..';
import { getGridDefaultColumnTypes, GRID_CHECKBOX_SELECTION_COL_DEF } from '../../colDef';
import { GridBaseColDef } from '../../internals';
import { GridActionsColDef, GridColDef, GridSingleSelectColDef } from '../../models';
import { GridValidRowModel } from '../../models/gridRows';
import { GridPinnedColumnPosition } from '../features';

const defaultColDef = {
  ...getGridDefaultColumnTypes(),
  checkboxSelection: GRID_CHECKBOX_SELECTION_COL_DEF,
};

type DefaultColumnTypes<R extends GridValidRowModel> = {
  string: GridBaseColDef<R>;
  number: GridBaseColDef<R>;
  date: GridBaseColDef<R>;
  dateString: GridBaseColDef<R>;
  dateTime: GridBaseColDef<R>;
  boolean: GridBaseColDef<R>;
  singleSelect: GridSingleSelectColDef<R>;
  actions: GridActionsColDef<R>;
  custom: GridBaseColDef<R>;
  array: GridBaseColDef<R>;
  checkboxSelection: Omit<GridBaseColDef<R>, 'field'>;
};

export type DotSeparatedKeys<T> = T extends object
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

// New helper type merging default and custom types.
type DefaultHelper<R extends GridValidRowModel> = {
  [K in DefaultColumnType<R>]: (
    colDef: Omit<Partial<DefaultColumnTypes<R>[K]>, 'field'> &
      AdditionalProps & {
        field: DotSeparatedKeys<R>;
      },
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
          AdditionalProps & {
            field: DotSeparatedKeys<R>;
          },
      ) => GridColDef
    : (
        colDef: Omit<Partial<GridColDef<R>>, 'field'> &
          AdditionalProps & {
            field: DotSeparatedKeys<R>;
          },
      ) => GridColDef;
};

export function createColumnHelper<
  R extends GridValidRowModel,
  C extends Record<string, Partial<GridColDef<R>> & { extends?: DefaultColumnType<R> }>,
>(customColumnTypes: C = {} as C) {
  // Combine default and custom helpers.
  const helper = {} as Exclude<DefaultHelper<R>, keyof C> & CustomHelper<R, C>;

  // Build helper with a method for each default column type.
  (Object.keys(defaultColDef) as DefaultColumnType<R>[]).forEach((type) => {
    helper[type] = (colDef) => ({
      ...defaultColDef[type],
      ...colDef,
    });
  });

  for (const type in customColumnTypes) {
    const { extends: baseType, ...customType } = customColumnTypes[type];
    helper[type as keyof DefaultColumnTypes<R>] = (colDef) => ({
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
  };
}

export const columnHelper = createColumnHelper({
  multiSelect: {
    extends: 'actions',
    type: 'array',
  },
  test: {
    extends: 'actions',
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

type S = DotSeparatedKeys<Row>; // "name" | "tags" | "actions" | "test" | "person" | "person.name"
const props = columnHelper.createColumns<Row>((c) => [
  c.string({
    field: 'name',
    headerName: 'Name',
  }),
  c.checkboxSelection({
    field: 'name',
    headerName: 'Checkbox',
  }),
  c.multiSelect({ field: 'name', headerName: 'Tags' }),
  c.actions({ field: 'name', headerName: 'Actions', getActions: (params) => [] }),
  c.test({ field: 'actions', getActions: (params) => [] }),
  // ...other columns...
]);

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function humanize(str: string) {
  return capitalize(str.replace(/_ids?$/g, '').replace(/_/g, ' '));
}
