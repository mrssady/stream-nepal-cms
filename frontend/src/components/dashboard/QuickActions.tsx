"use client";

import Link from "next/link";
import {
  CalendarPlus,
  ImagePlus,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const actions = [
  {
    title: "Create User",
    href: "/users",
    icon: UserPlus,
  },
  {
    title: "Create Event",
    href: "/events",
    icon: CalendarPlus,
  },
  {
    title: "Upload Gallery",
    href: "/gallery",
    icon: ImagePlus,
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-6 py-4">
        <h2 className="font-semibold">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Quickly access common CMS tasks.
        </p>
      </div>

      <div className="grid gap-2 p-4 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="block"
            >
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 px-4 py-4"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>

                <span className="text-sm font-medium">
                  {action.title}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}