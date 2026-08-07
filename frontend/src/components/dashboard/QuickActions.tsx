"use client";

import {
  CalendarPlus,
  FolderPlus,
  ShieldPlus,
  UserPlus,
} from "lucide-react";

const actions = [
  {
    title: "Create User",
    icon: UserPlus,
    color: "bg-blue-600",
  },
  {
    title: "Create Team",
    icon: ShieldPlus,
    color: "bg-green-600",
  },
  {
    title: "Create Event",
    icon: CalendarPlus,
    color: "bg-purple-600",
  },
  {
    title: "Upload Gallery",
    icon: FolderPlus,
    color: "bg-orange-500",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className={`${action.color} flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-white transition-all hover:scale-[1.03]`}
            >
              <Icon size={28} />

              <span className="text-sm font-semibold">
                {action.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}