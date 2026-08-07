export interface CrudColumn<T> {
  key: keyof T;
  title: string;
  render?: (item: T) => React.ReactNode;
}

export interface CrudPageProps<T> {
  title: string;
  description: string;

  data: T[];

  columns: CrudColumn<T>[];

  loading: boolean;

  search: string;
  setSearch: (value: string) => void;

  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  createButton: React.ReactNode;
  modal: React.ReactNode;
  deleteDialog: React.ReactNode;

  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}