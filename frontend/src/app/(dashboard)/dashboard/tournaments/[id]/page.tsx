"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  Pencil,
  Plus,
  Swords,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { getTournament } from "@/services/tournaments";

import { getTournamentTeams } from "@/services/players";

import { useRegistrations } from "@/hooks/useRegistrations";

import { useMatches } from "@/hooks/useMatches";

import ConfirmDialog from "@/components/common/ConfirmDialog";

import RegistrationModal from "@/components/tournaments/RegistrationModal";

import MatchModal from "@/components/tournaments/MatchModal";

import { resolveMediaUrl } from "@/lib/media";

import type {
  CreateMatchDto,
  Match,
  MatchStatus,
  UpdateMatchDto,
} from "@/types/match";

import type {
  CreateRegistrationDto,
  PaymentStatus,
  Registration,
  RegistrationStatus,
  UpdateRegistrationDto,
} from "@/types/registration";

import type { Tournament, TournamentStatus } from "@/types/tournament";

import type { TournamentTeam } from "@/types/player";

type Tab = "overview" | "registrations" | "matches";

const statusStyles: Record<TournamentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  PUBLISHED: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  REGISTRATION_OPEN:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  REGISTRATION_CLOSED:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  LIVE: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  COMPLETED:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  CANCELLED:
    "bg-slate-100 text-slate-500 dark:bg-muted dark:text-slate-400",
};

const registrationStatusStyles: Record<RegistrationStatus, string> = {
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  REJECTED:
    "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  WAITLIST:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  UNPAID:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  REFUNDED:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
};

const matchStatusStyles: Record<MatchStatus, string> = {
  SCHEDULED:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400",
  LIVE: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  CANCELLED:
    "bg-slate-100 text-slate-500 dark:bg-muted dark:text-slate-400",
};

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  if (!value) {
    return "Free";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "NPR",
  }).format(value);
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>

      <p className="mt-1 font-medium text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response: { data?: { message?: string } } })
      .response;

    if (response.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

export default function TournamentDetailPage() {
  const params = useParams();

  const tournamentId = params.id as string;

  const {
    registrations,
    loading: registrationsLoading,
    addRegistration,
    editRegistration,
    removeRegistration,
  } = useRegistrations();

  const {
    matches,
    loading: matchesLoading,
    addMatch,
    editMatch,
    removeMatch,
  } = useMatches();

  const [tournament, setTournament] = useState<Tournament | null>(null);

  const [teams, setTeams] = useState<TournamentTeam[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [registrationOpen, setRegistrationOpen] = useState(false);

  const [registrationMode, setRegistrationMode] = useState<"create" | "edit">(
    "create",
  );

  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  const [matchOpen, setMatchOpen] = useState(false);

  const [matchMode, setMatchMode] = useState<"create" | "edit">("create");

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<
    { kind: "registration" | "match"; id: string } | null
  >(null);

  useEffect(() => {
    if (!tournamentId) {
      return;
    }

    Promise.all([getTournament(tournamentId), getTournamentTeams()])
      .then(([tournamentData, teamsData]) => {
        setTournament(tournamentData);
        setTeams(teamsData);
      })
      .catch((error) => {
        console.error("Failed to load tournament:", error);
        setLoadError(getApiErrorMessage(error, "Failed to load tournament."));
      })
      .finally(() => setLoading(false));
  }, [tournamentId]);

  useEffect(() => {
    if (!deleteTarget) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDeleteTarget(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget]);

  const tournamentRegistrations = registrations.filter(
    (item) => item.tournamentId === tournamentId,
  );

  const tournamentMatches = matches.filter(
    (item) => item.tournamentId === tournamentId,
  );

  const approvedCount = tournamentRegistrations.filter(
    (item) => item.registrationStatus === "APPROVED",
  ).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading tournament...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">{loadError}</p>

        <Link
          href="/dashboard/tournaments"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Tournaments
        </Link>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-6">
        <p className="text-red-600 dark:text-red-400">Tournament not found.</p>

        <Link
          href="/dashboard/tournaments"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Tournaments
        </Link>
      </div>
    );
  }

  async function handleRegistrationSubmit(
    data: CreateRegistrationDto | UpdateRegistrationDto,
  ) {
    try {
      setSaving(true);

      if (registrationMode === "create") {
        await addRegistration(data as CreateRegistrationDto);
      } else if (selectedRegistration) {
        await editRegistration(
          selectedRegistration.id,
          data as UpdateRegistrationDto,
        );
      }

      setRegistrationOpen(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error(error);

      alert(getApiErrorMessage(error, "Unable to save registration."));
    } finally {
      setSaving(false);
    }
  }

  async function handleMatchSubmit(
    data: CreateMatchDto | UpdateMatchDto,
  ) {
    try {
      setSaving(true);

      if (matchMode === "create") {
        await addMatch(data as CreateMatchDto);
      } else if (selectedMatch) {
        await editMatch(selectedMatch.id, data as UpdateMatchDto);
      }

      setMatchOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error(error);

      alert(getApiErrorMessage(error, "Unable to save match."));
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickStatus(
    registration: Registration,
    status: RegistrationStatus,
  ) {
    try {
      await editRegistration(registration.id, { registrationStatus: status });
    } catch (error) {
      console.error(error);

      alert(getApiErrorMessage(error, "Unable to update registration."));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      if (deleteTarget.kind === "registration") {
        await removeRegistration(deleteTarget.id);
      } else {
        await removeMatch(deleteTarget.id);
      }

      setDeleteTarget(null);
    } catch (error) {
      console.error(error);

      alert(getApiErrorMessage(error, "Unable to delete."));
    }
  }

  function openCreateRegistration() {
    setSelectedRegistration(null);
    setRegistrationMode("create");
    setRegistrationOpen(true);
  }

  function openEditRegistration(registration: Registration) {
    setSelectedRegistration(registration);
    setRegistrationMode("edit");
    setRegistrationOpen(true);
  }

  function openCreateMatch() {
    setSelectedMatch(null);
    setMatchMode("create");
    setMatchOpen(true);
  }

  function openEditMatch(match: Match) {
    setSelectedMatch(match);
    setMatchMode("edit");
    setMatchOpen(true);
  }

  const tableCell = "px-4 py-3 text-sm";
  const tableHeader = `${tableCell} text-xs font-semibold text-slate-500 dark:text-slate-400`;

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link
          href="/dashboard/tournaments"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Tournaments
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {tournament.banner ? (
            <div className="h-56 overflow-hidden">
              <img
                src={resolveMediaUrl(tournament.banner)}
                alt={tournament.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-5xl font-bold text-white">
              {tournament.name
                .split(" ")
                .slice(0, 2)
                .map((word) => word.charAt(0))
                .join("")
                .toUpperCase() || "SN"}
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[tournament.status]}`}
                  >
                    {formatLabel(tournament.status)}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {formatLabel(tournament.game)}
                  </span>

                  {tournament.featured && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {tournament.name}
                </h1>

                <p className="mt-1 text-sm text-slate-400">/{tournament.slug}</p>

                {tournament.description && (
                  <p className="mt-3 max-w-3xl whitespace-pre-line text-slate-500 dark:text-slate-400">
                    {tournament.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {formatDate(tournament.tournamentStart)}
                    {" - "}
                    {formatDate(tournament.tournamentEnd)}
                  </span>

                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    {tournament.currentTeams}/{tournament.maxTeams} teams
                  </span>

                  <span className="flex items-center gap-2">
                    <Wallet size={16} />
                    Entry: {formatPrice(tournament.registrationFee)}
                  </span>

                  {tournament.prizePool && (
                    <span className="flex items-center gap-2">
                      <Swords size={16} />
                      Prize Pool: {tournament.prizePool}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-3">
                <div className="rounded-xl border border-slate-200 px-4 py-3 text-center dark:border-slate-700">
                  <Users
                    size={18}
                    className="mx-auto mb-1 text-slate-400 dark:text-slate-500"
                  />

                  <div className="text-xl font-bold">
                    {tournamentRegistrations.length}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Registrations
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 px-4 py-3 text-center dark:border-slate-700">
                  <Check
                    size={18}
                    className="mx-auto mb-1 text-slate-400 dark:text-slate-500"
                  />

                  <div className="text-xl font-bold">{approvedCount}</div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Approved
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 px-4 py-3 text-center dark:border-slate-700">
                  <Swords
                    size={18}
                    className="mx-auto mb-1 text-slate-400 dark:text-slate-500"
                  />

                  <div className="text-xl font-bold">
                    {tournamentMatches.length}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Matches
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        {[
          ["overview", "Overview"],
          ["registrations", `Registrations (${tournamentRegistrations.length})`],
          ["matches", `Matches (${tournamentMatches.length})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value as Tab)}
            className={`rounded-lg px-5 py-2 text-sm font-medium ${
              activeTab === value
                ? "bg-slate-900 text-white dark:bg-blue-600"
                : "text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Schedule
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  label="Registration Opens"
                  value={formatDate(tournament.registrationOpen)}
                />

                <InfoItem
                  label="Registration Closes"
                  value={formatDate(tournament.registrationClose)}
                />

                <InfoItem
                  label="Starts"
                  value={formatDate(tournament.tournamentStart)}
                />

                <InfoItem
                  label="Ends"
                  value={formatDate(tournament.tournamentEnd)}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Competition
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  label="Organizer"
                  value={tournament.organizer}
                />

                <InfoItem
                  label="Game"
                  value={formatLabel(tournament.game)}
                />

                <InfoItem
                  label="Max Teams"
                  value={tournament.maxTeams}
                />

                <InfoItem
                  label="Current Teams"
                  value={tournament.currentTeams}
                />

                <InfoItem
                  label="Entry Fee"
                  value={formatPrice(tournament.registrationFee)}
                />

                <InfoItem
                  label="Prize Pool"
                  value={tournament.prizePool || "—"}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Availability
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  label="Public"
                  value={tournament.isPublic ? "Yes" : "No"}
                />

                <InfoItem
                  label="Featured"
                  value={tournament.featured ? "Yes" : "No"}
                />
              </div>

              {tournament.rules && (
                <div className="mt-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rules
                  </p>

                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                    {tournament.rules}
                  </p>
                </div>
              )}

              {(tournament.discordUrl ||
                tournament.whatsappUrl ||
                tournament.streamUrl ||
                tournament.websiteUrl) && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {tournament.discordUrl && (
                    <a
                      href={tournament.discordUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <ExternalLink size={13} />
                      Discord
                    </a>
                  )}

                  {tournament.whatsappUrl && (
                    <a
                      href={tournament.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <ExternalLink size={13} />
                      WhatsApp
                    </a>
                  )}

                  {tournament.streamUrl && (
                    <a
                      href={tournament.streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <ExternalLink size={13} />
                      Stream
                    </a>
                  )}

                  {tournament.websiteUrl && (
                    <a
                      href={tournament.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <ExternalLink size={13} />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "registrations" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openCreateRegistration}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              <Plus size={16} />
              Add Registration
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {registrationsLoading && tournamentRegistrations.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                Loading registrations...
              </div>
            ) : tournamentRegistrations.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-medium text-slate-900 dark:text-white">
                  No registrations yet
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add a team to start the roster.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className={tableHeader}>Team</th>
                    <th className={tableHeader}>Captain</th>
                    <th className={tableHeader}>IGN / UID</th>
                    <th className={tableHeader}>Status</th>
                    <th className={tableHeader}>Payment</th>
                    <th className={`${tableHeader} text-right`}>Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tournamentRegistrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className={tableCell}>
                        <div className="flex items-center gap-3">
                          {registration.teamLogo && (
                            <img
                              src={resolveMediaUrl(registration.teamLogo)}
                              alt={registration.teamName}
                              className="size-9 rounded-lg object-cover"
                            />
                          )}

                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {registration.teamName}
                            </p>

                            <p className="text-xs text-slate-400">
                              {registration.managerName ||
                                registration.captainName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={tableCell}>
                        <p>{registration.captainName}</p>

                        <p className="text-xs text-slate-400">
                          {registration.captainEmail}
                        </p>
                      </td>

                      <td className={tableCell}>
                        <p>{registration.gameIGN}</p>

                        <p className="text-xs text-slate-400">
                          {registration.gameUID}
                        </p>
                      </td>

                      <td className={tableCell}>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${registrationStatusStyles[registration.registrationStatus]}`}
                          >
                            {formatLabel(registration.registrationStatus)}
                          </span>

                          {registration.registrationStatus === "PENDING" && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickStatus(registration, "APPROVED")
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 transition hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400"
                                title="Approve"
                              >
                                <Check size={12} />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickStatus(registration, "REJECTED")
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400"
                                title="Reject"
                              >
                                <X size={12} />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className={tableCell}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusStyles[registration.paymentStatus]}`}
                        >
                          {formatLabel(registration.paymentStatus)}
                        </span>
                      </td>

                      <td className={`${tableCell} text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditRegistration(registration)
                            }
                            className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                kind: "registration",
                                id: registration.id,
                              })
                            }
                            className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "matches" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openCreateMatch}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              <Plus size={16} />
              Add Match
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {matchesLoading && tournamentMatches.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                Loading matches...
              </div>
            ) : tournamentMatches.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-medium text-slate-900 dark:text-white">
                  No matches yet
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Schedule the first fixture.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className={tableHeader}>Match</th>
                    <th className={tableHeader}>Teams</th>
                    <th className={tableHeader}>Type</th>
                    <th className={tableHeader}>Scheduled</th>
                    <th className={tableHeader}>Status</th>
                    <th className={`${tableHeader} text-right`}>Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tournamentMatches.map((match) => (
                    <tr
                      key={match.id}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className={tableCell}>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {match.title}
                        </p>

                        {match.round && (
                          <p className="text-xs text-slate-400">
                            {match.round}
                          </p>
                        )}
                      </td>

                      <td className={tableCell}>
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2">
                            {match.homeTeam?.teamName || "Home Team"}
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {match.homeScore || 0}
                            </span>
                          </span>

                          <span className="flex items-center gap-2">
                            {match.awayTeam?.teamName || "Away Team"}
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {match.awayScore || 0}
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className={tableCell}>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {match.matchType}
                        </span>
                      </td>

                      <td className={tableCell}>
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Clock size={13} />
                          {formatDateTime(match.scheduledAt)}
                        </span>
                      </td>

                      <td className={tableCell}>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${matchStatusStyles[match.status]}`}
                        >
                          {formatLabel(match.status)}
                        </span>
                      </td>

                      <td className={`${tableCell} text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditMatch(match)}
                            className="rounded-lg border border-slate-300 p-2 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                kind: "match",
                                id: match.id,
                              })
                            }
                            className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <RegistrationModal
        open={registrationOpen}
        mode={registrationMode}
        loading={saving}
        tournamentId={tournamentId}
        initialData={selectedRegistration}
        onClose={() => {
          if (!saving) {
            setRegistrationOpen(false);
            setSelectedRegistration(null);
          }
        }}
        onSubmit={handleRegistrationSubmit}
      />

      <MatchModal
        open={matchOpen}
        mode={matchMode}
        loading={saving}
        tournamentId={tournamentId}
        teams={teams}
        initialData={selectedMatch}
        onClose={() => {
          if (!saving) {
            setMatchOpen(false);
            setSelectedMatch(null);
          }
        }}
        onSubmit={handleMatchSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget?.kind === "registration"
            ? "Delete registration"
            : "Delete match"
        }
        message="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}