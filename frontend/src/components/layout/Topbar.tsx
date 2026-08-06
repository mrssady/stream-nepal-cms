export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">
      <h1 className="text-xl font-semibold">
        Dashboard
      </h1>

      <span className="text-sm text-gray-500">
        Admin
      </span>
    </header>
  );
}