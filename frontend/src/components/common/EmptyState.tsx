type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-border dark:bg-card">
      <h2 className="text-xl font-semibold">{title}</h2>

      {description && (
        <p className="mt-2 text-gray-500 dark:text-muted-foreground">{description}</p>
      )}
    </div>
  );
}