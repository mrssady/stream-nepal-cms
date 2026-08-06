type Column<T> = {
  key: keyof T;
  title: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-3 text-left text-sm font-semibold"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-t">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-4 py-3"
                >
                  {String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}