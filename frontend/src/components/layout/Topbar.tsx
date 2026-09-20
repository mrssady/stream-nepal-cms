"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import {
  Bell,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";

import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Button,
} from "@/components/ui/button";
import {
  Separator,
} from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import GlobalSearch from "@/components/layout/GlobalSearch";

import { useAuth } from "@/providers/auth-provider";

const PAGE_TITLES: {
  match: RegExp;
  title: string;
}[] = [
  {
    match: /^\/dashboard$/,
    title: "Dashboard",
  },
  {
    match: /^\/users/,
    title: "Users",
  },
  {
    match: /^\/dashboard\/services/,
    title: "Services",
  },
  {
    match: /^\/projects/,
    title: "Projects",
  },
  {
    match: /^\/events/,
    title: "Events",
  },
  {
    match: /^\/event-series/,
    title: "Event Series",
  },
  {
    match: /^\/gallery/,
    title: "Gallery",
  },
  {
    match: /^\/sponsors/,
    title: "Sponsors",
  },
  {
    match: /^\/organizations/,
    title: "Organizations",
  },
  {
    match: /^\/settings/,
    title: "Settings",
  },
];

function getPageTitle(pathname: string) {
  const match = PAGE_TITLES.find(
    (entry) => entry.match.test(pathname),
  );

  return match?.title ?? "Dashboard";
}

export default function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { user, signOut } = useAuth();

  const isDark =
    mounted && theme === "dark";

  const displayName =
    user?.name || "User";
  const displayEmail =
    user?.email || "";
  const initial =
    displayName
      .charAt(0)
      .toUpperCase() || "U";

  const pageTitle =
    getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
      {/* Sidebar toggle */}
      <SidebarTrigger />

      <Separator
        orientation="vertical"
        className="mr-1 h-6"
      />

      {/* Page title */}
      <div className="flex min-w-0 flex-1 items-center">
        <div>
          <h1 className="text-sm font-semibold">
            {pageTitle}
          </h1>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Stream Nepal CMS
          </p>
        </div>
      </div>

      {/* Search */}
      <GlobalSearch />

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell />

              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
            </Button>
          }
        />

        <DropdownMenuContent
          align="end"
          className="w-72"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Notifications
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <Bell
                size={22}
                className="mx-auto mb-2 opacity-40"
              />

              <p>
                No notifications yet.
              </p>
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={
          isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        onClick={() =>
          setTheme(
            isDark
              ? "light"
              : "dark",
          )
        }
      >
        {isDark ? (
          <Sun />
        ) : (
          <Moon />
        )}
      </Button>

      {/* Settings */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Settings"
        nativeButton={false}
        render={<Link href="/settings" />}
      >
        <Settings />
      </Button>

      <Separator
        orientation="vertical"
        className="mx-1 h-6"
      />

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initial}
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-medium">
            {displayName}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {displayEmail}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Logout"
          onClick={() => signOut()}
        >
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
