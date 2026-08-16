"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  BriefcaseBusiness,
  FolderKanban,
  GalleryVerticalEnd,
  Handshake,
  Layers3,
  Search,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { getEvents } from "@/services/event";
import { getProjects } from "@/services/projects";
import { getServices } from "@/services/services";
import { getUsers } from "@/services/users";
import { getSponsors } from "@/services/sponsors";
import { getEventSeries } from "@/services/event-series";
import { getMedia } from "@/services/media";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

type SearchItem = {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: LucideIcon;
};

async function loadItems(): Promise<SearchItem[]> {
  const [
    events,
    projects,
    services,
    users,
    sponsors,
    series,
    media,
  ] = await Promise.allSettled([
    getEvents(),
    getProjects(),
    getServices(),
    getUsers(),
    getSponsors(),
    getEventSeries(),
    getMedia(),
  ]);

  const items: SearchItem[] = [];

  if (events.status === "fulfilled") {
    for (const event of events.value) {
      items.push({
        id: `event-${event.id}`,
        group: "Events",
        label: event.title,
        sublabel: event.slug,
        href: `/events/${event.id}`,
        icon: Trophy,
      });
    }
  }

  if (projects.status === "fulfilled") {
    for (const project of projects.value) {
      items.push({
        id: `project-${project.id}`,
        group: "Projects",
        label: project.title,
        sublabel: project.slug,
        href: "/projects",
        icon: FolderKanban,
      });
    }
  }

  if (services.status === "fulfilled") {
    for (const service of services.value) {
      items.push({
        id: `service-${service.id}`,
        group: "Services",
        label: service.title,
        sublabel: service.slug,
        href: "/dashboard/services",
        icon: BriefcaseBusiness,
      });
    }
  }

  if (series.status === "fulfilled") {
    for (const item of series.value) {
      items.push({
        id: `series-${item.id}`,
        group: "Event Series",
        label: item.title,
        sublabel: item.slug,
        href: "/event-series",
        icon: Layers3,
      });
    }
  }

  if (users.status === "fulfilled") {
    for (const user of users.value) {
      items.push({
        id: `user-${user.id}`,
        group: "Users",
        label: user.name,
        sublabel: user.email,
        href: "/users",
        icon: Users,
      });
    }
  }

  if (sponsors.status === "fulfilled") {
    for (const sponsor of sponsors.value) {
      items.push({
        id: `sponsor-${sponsor.id}`,
        group: "Sponsors",
        label: sponsor.name,
        sublabel: sponsor.tier,
        href: "/sponsors",
        icon: Handshake,
      });
    }
  }

  if (media.status === "fulfilled") {
    for (const item of media.value) {
      items.push({
        id: `media-${item.id}`,
        group: "Gallery",
        label: item.title || "Untitled",
        sublabel: item.platform,
        href: "/gallery",
        icon: GalleryVerticalEnd,
      });
    }
  }

  return items;
}

export default function GlobalSearch() {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);
  const [items, setItems] =
    useState<SearchItem[] | null>(
      null,
    );
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    function onKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "k" &&
        (event.metaKey ||
          event.ctrlKey)
      ) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    document.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () =>
      document.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, []);

  async function handleOpenChange(
    next: boolean,
  ) {
    setOpen(next);

    if (next && items === null) {
      setLoading(true);

      try {
        setItems(await loadItems());
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
  }

  const grouped = useMemo(() => {
    if (!items) return [];

    const groups = new Map<
      string,
      SearchItem[]
    >();

    for (const item of items) {
      const group =
        groups.get(item.group) ??
        [];

      group.push(item);
      groups.set(
        item.group,
        group,
      );
    }

    return Array.from(
      groups.entries(),
    );
  }, [items]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition hover:bg-muted/70 md:flex lg:w-80"
        aria-label="Search across the admin panel"
      >
        <Search
          size={15}
          className="shrink-0 opacity-60"
        />

        <span className="flex-1 text-left">
          Search...
        </span>

        <kbd className="pointer-events-none rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Global Search"
        description="Search across all admin content"
      >
        <CommandInput placeholder="Search events, projects, services, users..." />

        <CommandList>
          {loading && (
            <CommandEmpty>
              Loading results...
            </CommandEmpty>
          )}

          {!loading &&
            items !== null &&
            grouped.length === 0 && (
              <CommandEmpty>
                No results found.
              </CommandEmpty>
            )}

          {grouped.map(
            ([group, groupItems]) => (
              <CommandGroup
                key={group}
                heading={group}
              >
                {groupItems.map(
                  (item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${item.sublabel ?? ""} ${group}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(
                          item.href,
                        );
                      }}
                    >
                      <item.icon className="size-4 text-muted-foreground" />

                      <span className="truncate">
                        {item.label}
                      </span>

                      {item.sublabel && (
                        <span className="ml-auto truncate text-xs text-muted-foreground">
                          {item.sublabel}
                        </span>
                      )}

                      <CommandShortcut>
                        {item.group}
                      </CommandShortcut>
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            ),
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
