'use client';
import {
  DataGrid,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GridColDef,
  useGridApiRef,
} from '@mui/x-data-grid';
import * as React from 'react';
import { cn } from '../../lib/cn';
import { GlowingEffect } from './glowing-effect';

const columns: GridColDef<(typeof rows)[number]>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 150,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    width: 150,
    editable: true,
    renderCell: (params) => {
      return (
        <>
          <span className="size-2 bg-blue-600 rounded-full"></span>
          {params.value}
        </>
      );
    },
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
  {
    field: 'nested.description',
    headerName: 'Description',
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14, nested: { description: 'test' } },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31, nested: { description: 'test' } },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

let index = rows.length;

const detailPanel = (row) => {
  return (
    <div className="flex justify-center items-center p-4 w-full flex-1 text-center">{row.id}</div>
  );
};
export const HeroDataGrid = () => {
  const apiRef = useGridApiRef();
  const [data, setData] = React.useState(rows);
  const [isLoading, setIsLoading] = React.useState(false);

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
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        className="hidden dark:flex"
      />
      <DataGrid
        className="text-[13px]"
        rows={data}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
          pinnedColumns: {
            left: [GRID_DETAIL_PANEL_TOGGLE_FIELD, 'lastName'],
            right: ['id'],
          },

          /* pinnedRows: {
            top: [1],
            bottom: [2],
          }, */
          rowSelection: [3],
          rowGrouping: {
            model: ['lastName', 'firstName'],
          },
          aggregation: {
            model: {
              lastName: 'count',
            },
          },
        }}
        onSortModelChange={(model, detail) => {
          detail.api.scrollToIndexes({ rowIndex: 0 });
          //detail.api.setRows([]);
        }}
        pageSizeOptions={[5]}
        // checkboxSelection
        disableRowSelectionOnClick
        checkboxSelection
        loading={isLoading}
        getDetailPanelContent={detailPanel}
        defaultGroupingExpansionDepth={-1}
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
        apiRef={apiRef}
      />
    </div>
  );
};
