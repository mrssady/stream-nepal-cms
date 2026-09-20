"use client";

import {
  Check,
  Crown,
  Info,
  KeyRound,
  Minus,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useRoles } from "@/hooks/useRoles";
import { useAuth } from "@/providers/auth-provider";
import type {
  MatrixGroup,
  RoleInfo,
} from "@/types/role";
import type { UserRole } from "@/types/user";

const ROLE_COLUMNS: UserRole[] = [
  "STAFF",
  "MANAGER",
  "ADMIN",
  "CO_OWNER",
  "OWNER",
];

const roleStyles: Record<
  UserRole,
  string
> = {
  OWNER:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",

  CO_OWNER:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",

  ADMIN:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",

  MANAGER:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",

  STAFF:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
};

const dotStyles: Record<
  UserRole,
  string
> = {
  OWNER: "bg-purple-500 dark:bg-purple-400",
  CO_OWNER: "bg-indigo-500 dark:bg-indigo-400",
  ADMIN: "bg-blue-500 dark:bg-blue-400",
  MANAGER: "bg-amber-500 dark:bg-amber-400",
  STAFF: "bg-slate-400 dark:bg-slate-500",
};

function formatRole(role: UserRole) {
  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function RoleCard({
  role,
  isCurrentUser,
}: {
  role: RoleInfo;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border bg-card p-5 ${
        isCurrentUser
          ? "ring-2 ring-primary/60"
          : ""
      }`}
    >
      {isCurrentUser && (
        <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
          You
        </span>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${roleStyles[role.role]}`}
          >
            {role.label
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2 className="font-semibold">
              {role.label}
            </h2>

            <p className="text-xs text-muted-foreground">
              Level {role.level}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          {role.memberCount}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {role.description}
      </p>

      <ul className="mt-4 space-y-2">
        {role.exampleCapabilities.map(
          (capability) => (
            <li
              key={capability}
              className="flex items-start gap-2 text-sm"
            >
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />

              <span>
                {capability}
              </span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function MatrixTable({
  group,
  currentRole,
}: {
  group: MatrixGroup;
  currentRole: string | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
        <h3 className="font-medium">
          {group.label}
        </h3>

        <span className="text-xs text-muted-foreground">
          {group.rows.length}{" "}
          {group.rows.length === 1
            ? "permission"
            : "permissions"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/20">
            <tr>
              <th className="min-w-64 px-5 py-3 text-left font-medium">
                Permission
              </th>

              {ROLE_COLUMNS.map((role) => (
                <th
                  key={role}
                  className={`px-3 py-3 text-center font-medium ${
                    currentRole === role
                      ? "text-primary"
                      : ""
                  }`}
                >
                  <span className="flex flex-col items-center gap-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[role]}`}
                    >
                      {formatRole(role)}
                    </span>

                    {currentRole === role && (
                      <span className="text-[11px] font-semibold">
                        You
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {group.rows.map((row) => (
              <tr
                key={row.id}
                className="transition hover:bg-muted/30"
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium">
                    {row.resource}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {row.action}
                  </p>
                </td>

                {ROLE_COLUMNS.map((role) => (
                  <td
                    key={role}
                    className="px-3 py-3.5 text-center"
                  >
                    {row.grants[role] ? (
                      <span
                        className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
                        title={`${formatRole(role)}: allowed`}
                      >
                        <Check className="size-3.5" />
                      </span>
                    ) : (
                      <span
                        className="inline-flex size-6 items-center justify-center rounded-full text-slate-300 dark:text-slate-600"
                        title={`${formatRole(role)}: denied`}
                      >
                        <Minus className="size-3.5" />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RolesPage() {
  const { data, loading, fetchRoles } =
    useRoles();

  const { user } = useAuth();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Roles Management
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            User roles and the permissions
            each role receives across the
            CMS.
          </p>
        </div>

        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading roles...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Roles Management
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            User roles and the permissions
            each role receives across the
            CMS.
          </p>
        </div>

        <div className="rounded-xl border p-10 text-center">
          <p className="font-medium">
            Could not load roles
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Make sure you are signed in with
            an Admin or Owner account.
          </p>

          <button
            onClick={fetchRoles}
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted/40"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const currentRole = user?.role;

  const orderedRoles = [...data.roles]
    .sort(
      (a, b) => b.level - a.level,
    );

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">
          Roles Management
        </h1>

        <p className="text-sm text-muted-foreground">
          Five built-in roles with a
          fixed hierarchy. A role receives
          every permission of the roles
          below it. Access is enforced
          server-side on every request.
        </p>
      </div>

      {/* Role catalog */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {orderedRoles.map((role) => (
          <RoleCard
            key={role.role}
            role={role}
            isCurrentUser={
              currentRole === role.role
            }
          />
        ))}

        {/* Level ladder card */}

        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />

            <h2 className="font-semibold">
              Level Ladder
            </h2>
          </div>

          <div className="mt-4 space-y-2">
            {orderedRoles.map((role) => (
              <div
                key={role.role}
                className="flex items-center gap-3"
              >
                <span
                  className={`size-2.5 shrink-0 rounded-full ${dotStyles[role.role]}`}
                />

                <span className="w-24 text-sm font-medium">
                  {role.label}
                </span>

                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(role.level / 5) * 100}%`,
                    }}
                  />
                </div>

                <span className="w-10 text-right text-xs text-muted-foreground">
                  Lv {role.level}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />

            <span>
              Owners can never be removed
              while they are the last
              Owner. Higher roles can
              always manage lower roles.
            </span>
          </p>
        </div>
      </div>

      {/* Permission matrix */}

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-muted-foreground" />

          <h2 className="text-lg font-semibold">
            Permission Matrix
          </h2>
        </div>

        {data.matrix.map((group) => (
          <MatrixTable
            key={group.id}
            group={group}
            currentRole={currentRole}
          />
        ))}
      </div>

      {/* Legend + note */}

      <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-5 text-sm sm:flex-row sm:items-start sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Check className="size-3.5" />
          </span>

          <span className="text-muted-foreground">
            Allowed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-full text-slate-300 dark:text-slate-600">
            <Minus className="size-3.5" />
          </span>

          <span className="text-muted-foreground">
            Denied
          </span>
        </div>

        <p className="flex items-center gap-2 text-muted-foreground">
          <Crown className="size-4 shrink-0 text-amber-500" />

          <span>
            Restricting an action to{" "}
            <strong>Admin</strong> also
            grants it to Co-Owners and the
            Owner — enforcement uses the
            highest declared level.
          </span>
        </p>
      </div>
    </div>
  );
}

export default RolesPage;