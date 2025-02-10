import Box from '@mui/material/Box';
import {
  DataGrid,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GridColDef,
} from '@mui/x-data-grid';
import * as React from 'react';

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
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
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
  return <div style={{ height: 100, width: 600 }}>{row.id}</div>;
};
export default function DataGridDemo() {
  const [data, setData] = React.useState(rows);
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        autoFocus="lastName"
        rows={[]}
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
        }}
        onSortModelChange={(model, detail) => {
          detail.api.scrollToIndexes({ rowIndex: 0 });
          detail.api.setRows([]);
        }}
        pageSizeOptions={[5]}
        // checkboxSelection
        disableRowSelectionOnClick
        checkboxSelection
        loading={isLoading}
        getDetailPanelContent={detailPanel}
        onRowsScrollEnd={async (params, detail) => {
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
        }}
      />
    </Box>
  );
}
