"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

import {
  getActiveOrganizationId,
  saveActiveOrganizationId,
} from "@/lib/org";

import { useOrganizations } from "@/hooks/useOrganizations";

export default function OrganizationSwitcher() {
  const { organizations, loading } =
    useOrganizations();

  const [switching, setSwitching] =
    useState(false);

  const activeId =
    getActiveOrganizationId();

  const active =
    organizations.find(
      (organization) =>
        organization.id === activeId,
    ) || null;

  const name = active?.name || "Organization";

  function handleSelect(id: string) {
    if (id === activeId || switching) {
      return;
    }

    setSwitching(true);
    saveActiveOrganizationId(id);

    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            tooltip={name}
          >
            <Building2 />

            <div className="flex min-w-0 flex-col text-left leading-tight">
              <span className="truncate font-semibold">
                {name}
              </span>

              <span className="truncate text-xs text-muted-foreground">
                Switch organization
              </span>
            </div>
          </SidebarMenuButton>
        }
      />

      <DropdownMenuContent
        align="start"
        side="top"
        className="w-64"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Organizations
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {loading ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading organizations...
            </div>
          ) : organizations.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No organizations yet.
            </div>
          ) : (
            organizations.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                variant="default"
                disabled={switching}
                onClick={() =>
                  handleSelect(organization.id)
                }
              >
                <span className="truncate">
                  {organization.name}
                </span>

                {organization.id === activeId && (
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    Active
                  </span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}