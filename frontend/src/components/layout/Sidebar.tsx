"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Handshake,
  Image,
  LayoutDashboard,
  Settings,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

const menus = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Teams",
    href: "/teams",
    icon: Shield,
  },
  {
    name: "Players",
    href: "/players",
    icon: Gamepad2,
  },
  {
    name: "Events",
    href: "/events",
    icon: Trophy,
  },
  {
    name: "Gallery",
    href: "/gallery",
    icon: Image,
  },
  {
    name: "Sponsors",
    href: "/sponsors",
    icon: Handshake,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-7 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow"
      >
        {collapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>

      <div className="border-b border-slate-200 p-6">
        <h1
          className={`font-bold text-blue-600 transition-all ${
            collapsed ? "text-lg" : "text-2xl"
          }`}
        >
          SN
        </h1>

        {!collapsed && (
          <>
            <p className="mt-2 text-lg font-semibold">
              Stream Nepal
            </p>

            <p className="text-sm text-slate-500">
              CMS v1.0
            </p>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menus.map((item) => {
          const active = pathname === item.href;

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-xl transition-all ${
                collapsed
                  ? "justify-center p-3"
                  : "gap-3 px-4 py-3"
              } ${
                active
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={20} />

              {!collapsed && (
                <span className="font-medium">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        {collapsed ? (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            A
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              A
            </div>

            <div>
              <p className="font-semibold">
                Administrator
              </p>

              <p className="text-xs text-slate-500">
                Stream Nepal
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}