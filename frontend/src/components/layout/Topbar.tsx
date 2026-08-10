"use client";

import { Bell, Settings } from "lucide-react";

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
  Input,
} from "@/components/ui/input";

export default function Topbar() {
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
            Dashboard
          </h1>

          <p className="hidden text-xs text-muted-foreground sm:block">
            Stream Nepal CMS
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="hidden w-64 md:block lg:w-80">
        <Input
          placeholder="Search..."
          className="h-9"
        />
      </div>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
      >
        <Bell />

        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
      </Button>

      {/* Settings */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Settings"
      >
        <Settings />
      </Button>

      <Separator
        orientation="vertical"
        className="mx-1 h-6"
      />

      {/* Administrator */}
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          A
        </div>

        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-medium">
            Administrator
          </p>

          <p className="truncate text-xs text-muted-foreground">
            admin@streamnepal.com
          </p>
        </div>
      </div>
    </header>
  );
}