'use client';
import { columnHelper, DataGrid, GridPreferencePanelsValue, useGridApiRef } from '@mui/x-data-grid';
import { GRID_ROOT_FOOTER_ID } from '@mui/x-data-grid/hooks/features/aggregation/useGridAggregation';
import { Edit3Icon, Trash2Icon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/cn';
import { GlowingEffect } from './glowing-effect';

const props = columnHelper.createColumns<(typeof rows)[number]>((c) => [
  c.detailPanel({
    pinned: 'left',
  }),
  c.checkboxSelection({
    pinned: 'left',
  }),
  // this is a placeholder for the row grouping column that will be added by the row grouping feature
  c.group(),
  c.string({
    field: 'id',
    headerName: 'ID',
    width: 90,
  }),
  c.string({
    field: 'firstName',
    headerName: 'First name',
    width: 150,
    editable: true,
    aggregation: 'distinct',
  }),
  c.string({
    field: 'lastName',
    headerName: 'Last name',
    width: 150,
    editable: true,
    renderCell: (params) => {
      return (
        <React.Fragment>
          <span className="size-2 bg-blue-600 rounded-full" />
          {params.value}
        </React.Fragment>
      );
    },
  }),
  c.number({
    field: 'age',
    headerName: 'Age',
    width: 110,
    editable: true,
    aggregation: 'avg',
  }),
  c.number({
    field: 'custom_fakeAge',
    headerName: 'Age',
    width: 110,
    editable: true,
    valueGetter: (value, row) => row.age,
    valueFormatter: (value) => {
      if (value == null) {
        return value;
      }
      return `${Math.round(value)} years`;
    },
  }),
  c.string({
    field: 'calc_fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  }),
  c.string({
    field: 'nested.description',
    headerName: 'Description',
    editable: true,
  }),
  c.date({
    field: 'updated_at',
    headerName: 'Updated At',
    editable: true,
  }),
  c.boolean({
    field: 'is_filled',
    headerName: 'Is Filled',
    editable: true,
  }),
  c.singleSelect({
    field: 'gender',
    type: 'string',
    editCell: 'singleSelect',
    editCellParams: {
      valueOptions: ['Male', 'Female'],
    },
    editable: true,
  }),
  c.array({
    field: 'tags',
    headerName: 'Tags',
  }),
  c.actions({
    field: 'actions',
    headerName: 'Actions',
    pinned: 'right',
    cellClassName: '!px-0',
    width: 70,
    renderHeader: ({ api }) => {
      const rootProps = api.getRootProps();
      return (
        <rootProps.slots.baseIconButton
          variant="ghost"
          className="text-[14px] hover:bg-grid-bg tracking-widest pb-1.5"
          onClick={() => api.showPreferences(GridPreferencePanelsValue.columns)}
        >
          ...
        </rootProps.slots.baseIconButton>
      );
    },
    getActions: (params, { Button, IconButton, MenuItem }) => {
      return [
        <IconButton>
          <Edit3Icon />
        </IconButton>,
        <MenuItem>
          <Trash2Icon />
          Delete row
        </MenuItem>,
      ];
    },
  }),
]);

const rows = [
  {
    id: 1,
    lastName: 'Snow',
    firstName: 'Jon',
    age: 14,
    nested: { description: 'test' },
    updated_at: new Date(),
    is_filled: true,
    gender: 'Male',
    tags: ['tag1', 'tag2'],
  },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 30, nested: { description: 'test' } },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 15 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];
const props2 = columnHelper.inferFromData(rows, {
  initialPinnedColumns: {
    left: ['id'],
  },
});

const index = rows.length;

const detailPanel = (row) => {
  return (
    <div className="flex justify-center items-center p-4 w-full flex-1 text-center">{row.id}</div>
  );
};

const getRowHeight = (params) => {
  if (params.id === GRID_ROOT_FOOTER_ID) {
    return 44;
  }
};

export function HeroDataGrid() {
  const apiRef = useGridApiRef();
  const [data, setData] = React.useState(rows);
  const [columns, setColumns] = React.useState(props.columns);

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    apiRef.current?.showPreferences(GridPreferencePanelsValue.columns);

    requestAnimationFrame(() => {
      document.activeElement?.blur();
    });
  }, []);

  return (
    <div
      className={cn(
        'h-[400px] w-full relative',
        'mb-8 mt-8 min-w-[800px] select-none duration-1000 animate-in fade-in slide-in-from-bottom-12',
        'shadow-lg shadow-black/8 dark:shadow-black/30 rounded-[6px]',
      )}
    >
      <GlowingEffect
        spread={60}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        className="hidden dark:flex"
      />
      <DataGrid
        meta={{
          test: 123,
        }}
        className="text-[13px]"
        rows={data}
        {...props}
        /* pagination
        autoPageSize */
        initialState={{
          ...props.initialState,
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
          detailPanel: {
            expandedRowIds: new Set([3]),
          },

          /* pinnedRows: {
            top: [1],
            bottom: [2],
          }, */
          rowSelection: [2],
          rowGrouping: {
            model: ['lastName'],
          },
        }}
        onSortModelChange={(model, detail) => {
          detail.api.scrollToIndexes({ rowIndex: 0 });
          // detail.api.setRows([]);
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
        loading={isLoading}
        getDetailPanelContent={detailPanel}
        isGroupExpandedByDefault={(params) => {
          console.log('params', params);
          return params.id === 'auto-generated-row-lastName/Lannister';
        }}
        /* onRowsScrollEnd={async (params, detail) => {
          if (params.visibleRowsCount >= 40) {
            return;
          }
          const rowsToFetch = Math.min(40 - params.visibleRowsCount, rows.length);
          detail.setSkeletonRowCount(rowsToFetch);
          return new Promise((resolve) => {
            setTimeout(() => {
              setIsLoading(false);
              const newRows = rows
                .slice(0, rowsToFetch)
                .map((row, i) => ({ ...row, id: params.visibleRowsCount + i + 1 }));
              resolve(newRows);
            }, 300);
          });
        }} */
        getRowHeight={getRowHeight}
        apiRef={apiRef}
      />
    </div>
  );
}
