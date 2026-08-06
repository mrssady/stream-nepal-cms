export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="text-muted-foreground mt-2">
          Welcome to the Stream Nepal CMS Admin Panel.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-6">
          <h2 className="text-sm text-muted-foreground">
            Total Events
          </h2>

          <p className="mt-3 text-4xl font-bold">0</p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-sm text-muted-foreground">
            Teams
          </h2>

          <p className="mt-3 text-4xl font-bold">0</p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-sm text-muted-foreground">
            Players
          </h2>

          <p className="mt-3 text-4xl font-bold">0</p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-sm text-muted-foreground">
            Registrations
          </h2>

          <p className="mt-3 text-4xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}