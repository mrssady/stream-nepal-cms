"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Image,
  LayoutDashboard,
  Settings,
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
    name: "Services",
    href: "/services",
    icon: BriefcaseBusiness,
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

  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      {/* Collapse Button */}
      <button
        type="button"
        onClick={() =>
          setCollapsed(!collapsed)
        }
        className="absolute -right-4 top-7 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
        aria-label={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
      >
        {collapsed ? (
          <ChevronRight size={18} />
        ) : (
          <ChevronLeft size={18} />
        )}
      </button>

      {/* Logo / Brand */}
      <div className="border-b border-slate-200 p-6">
        <h1
          className={`font-bold text-blue-600 transition-all ${
            collapsed
              ? "text-center text-lg"
              : "text-2xl"
          }`}
        >
          SN
        </h1>

        {!collapsed && (
          <>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              Stream Nepal
            </p>

            <p className="text-sm text-slate-500">
              CMS v1.0
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menus.map((item) => {
          const Icon = item.icon;

          /*
           * Dashboard should only be active on "/".
           * Other pages are active when pathname matches
           * the menu route or one of its child routes.
           */
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`,
                );

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
              title={
                collapsed
                  ? item.name
                  : undefined
              }
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

      {/* Administrator */}
      <div className="border-t border-slate-200 p-4">
        {collapsed ? (
          <div
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
            title="Administrator"
          >
            A
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                Administrator
              </p>

              <p className="truncate text-xs text-slate-500">
                Stream Nepal
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}