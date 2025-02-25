'use client';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 90,
  },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 150,
  },
];

export default function Demo() {
  // [!code word:columns]
  return (
    <div style={{ height: 400 }}>
      <DataGrid columns={columns} />
    </div>
  );
}
