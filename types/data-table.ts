export interface DataTableProps {
  columns: {
    header: string;
    accessor: string;
    cell?: (value: any) => JSX.Element | string;
  }[];
  data: any[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean; // Changed from loading to isLoading
} 