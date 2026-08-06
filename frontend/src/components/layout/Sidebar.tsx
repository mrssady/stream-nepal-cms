export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white p-6">
      <h2 className="text-xl font-bold">Stream Nepal CMS</h2>

      <nav className="mt-8 space-y-3">
        <a href="/dashboard" className="block rounded p-2 hover:bg-slate-100">
          Dashboard
        </a>

        <a href="/events" className="block rounded p-2 hover:bg-slate-100">
          Events
        </a>

        <a href="/team" className="block rounded p-2 hover:bg-slate-100">
          Teams
        </a>

        <a href="/users" className="block rounded p-2 hover:bg-slate-100">
          Users
        </a>

        <a href="/settings" className="block rounded p-2 hover:bg-slate-100">
          Settings
        </a>
      </nav>
    </aside>
  );
}