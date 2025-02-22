'use client';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  {
    field: 'id',
  },
];

export default function Demo(props: { columns: any[] }) {
  return (
    <div style={{ height: 400 }}>
      <DataGrid rows={[]} columns={columns} />
    </div>
  );
}
