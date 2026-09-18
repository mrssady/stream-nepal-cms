"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BriefcaseBusiness,
  FolderKanban,
  GalleryVerticalEnd,
  Handshake,
  LayoutDashboard,
  Radio,
  ScanLine,
  Settings,
  Trophy,
  Users,
  Layers3,
  Gamepad2,
} from "lucide-react";

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuth } from "@/providers/auth-provider";

const mainMenu = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Live",
    href: "/live",
    icon: Radio,
  },
  {
    name: "OCR Profiles",
    href: "/live/ocr-profiles",
    icon: ScanLine,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
];

const contentMenu = [
  {
    name: "Services",
    href: "/dashboard/services",
    icon: BriefcaseBusiness,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Events",
    href: "/events",
    icon: Trophy,
  },
  {
    name: "Event Series",
    href: "/event-series",
    icon: Layers3,
  },
  {
    name: "Gallery",
    href: "/gallery",
    icon: GalleryVerticalEnd,
  },
  {
    name: "Sponsors",
    href: "/sponsors",
    icon: Handshake,
  },
  {
    name: "Players",
    href: "/players",
    icon: Gamepad2,
  },
];

const systemMenu = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function isActiveRoute(
  pathname: string,
  href: string,
) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function NavigationItem({
  name,
  href,
  icon: Icon,
}: {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  const pathname = usePathname();

  const active = isActiveRoute(
    pathname,
    href,
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={href} />}
        isActive={active}
        tooltip={name}
      >
        <Icon />
        <span>{name}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function Sidebar() {
  const { user } = useAuth();

  const displayName = user?.name || "Administrator";
  const initial = displayName.charAt(0).toUpperCase() || "A";

  return (
    <SidebarPrimitive
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/dashboard" />
              }
              size="lg"
              tooltip="Stream Nepal CMS"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                SN
              </div>

              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">
                  Stream Nepal
                </span>

                <span className="text-xs text-muted-foreground">
                  CMS
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Main
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => (
                <NavigationItem
                  key={item.href}
                  {...item}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Content
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {contentMenu.map((item) => (
                <NavigationItem
                  key={item.href}
                  {...item}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            System
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {systemMenu.map((item) => (
                <NavigationItem
                  key={item.href}
                  {...item}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Administrator"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initial}
              </div>

              <div className="flex min-w-0 flex-col text-left leading-tight">
                <span className="truncate font-semibold">
                  {displayName}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  Stream Nepal
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </SidebarPrimitive>
  );
}