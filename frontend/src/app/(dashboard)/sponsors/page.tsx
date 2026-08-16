"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { useSponsors } from "@/hooks/useSponsors";

import ImageUpload from "@/components/media/ImageUpload";

import SearchBar from "@/components/common/SearchBar";

import Pagination from "@/components/common/Pagination";

import { resolveMediaUrl } from "@/lib/media";

import {
  type CreateSponsorDto,
  type Sponsor,
  type SponsorTier,
  type UpdateSponsorDto,
} from "@/types/sponsors";

const ITEMS_PER_PAGE = 12;

const TIER_OPTIONS: {
  value: SponsorTier;
  label: string;
}[] = [
  {
    value: "TITLE",
    label: "Title Sponsor",
  },
  {
    value: "GOLD",
    label: "Gold",
  },
  {
    value: "SILVER",
    label: "Silver",
  },
  {
    value: "BRONZE",
    label: "Bronze",
  },
  {
    value: "MEDIA_PARTNER",
    label: "Media Partner",
  },
  {
    value: "PARTNER",
    label: "Partner",
  },
];

function formatTier(tier: SponsorTier) {
  const option = TIER_OPTIONS.find(
    (item) => item.value === tier,
  );

  return option ? option.label : tier;
}

export default function SponsorsPage() {
  const {
    sponsors,
    loading,
    error,
    addSponsor,
    editSponsor,
    removeSponsor,
  } = useSponsors();

  const [search, setSearch] = useState("");

  const [tierFilter, setTierFilter] =
    useState<"ALL" | SponsorTier>("ALL");

  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);

  const [modalMode, setModalMode] =
    useState<"create" | "edit">("create");

  const [selectedSponsor, setSelectedSponsor] =
    useState<Sponsor | null>(null);

  const [logoUrl, setLogoUrl] = useState("");

  const [saving, setSaving] = useState(false);

  const filteredSponsors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sponsors.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        (item.description ?? "")
          .toLowerCase()
          .includes(keyword);

      const matchesTier =
        tierFilter === "ALL" || item.tier === tierFilter;

      return matchesSearch && matchesTier;
    });
  }, [sponsors, search, tierFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSponsors.length / ITEMS_PER_PAGE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedSponsors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredSponsors.slice(
      start,
      start + ITEMS_PER_PAGE,
    );
  }, [filteredSponsors, currentPage]);

  function openCreate() {
    setModalMode("create");
    setSelectedSponsor(null);
    setLogoUrl("");
    setModalOpen(true);
  }

  function openEdit(item: Sponsor) {
    setModalMode("edit");
    setSelectedSponsor(item);
    setLogoUrl(item.logo ?? "");
    setModalOpen(true);
  }

  async function handleSubmit(
    data: CreateSponsorDto | UpdateSponsorDto,
  ) {
    try {
      setSaving(true);

      if (modalMode === "create") {
        await addSponsor(data as CreateSponsorDto);
      } else if (selectedSponsor) {
        await editSponsor(
          selectedSponsor.id,
          data as UpdateSponsorDto,
        );
      }

      setModalOpen(false);
      setSelectedSponsor(null);
    } catch (error) {
      console.error(error);

      alert("Unable to save sponsor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Sponsor) {
    const confirmed = window.confirm(
      `Delete "${item.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeSponsor(item.id);
    } catch (error) {
      console.error(error);

      alert("Unable to delete sponsor.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-12 text-center text-slate-500 dark:border-border dark:bg-card dark:text-slate-400">
          Loading sponsors...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Sponsors
          </h1>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage Stream Nepal sponsors,
            partners, and collaborators.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          <Plus size={18} />
          Add Sponsor
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}

      <div className="flex flex-col gap-3 md:flex-row">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search sponsors..."
        />

        <select
          value={tierFilter}
          onChange={(event) => {
            setTierFilter(
              event.target.value as
                | "ALL"
                | SponsorTier,
            );
            setPage(1);
          }}
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
        >
          <option value="ALL">All Tiers</option>

          {TIER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Empty */}

      {filteredSponsors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-border dark:bg-card">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {search || tierFilter !== "ALL"
              ? "No Sponsors Found"
              : "No Sponsors Yet"}
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {search || tierFilter !== "ALL"
              ? "Try changing your search or filter."
              : "Add your first sponsor, partner, or collaborator."}
          </p>

          {!search && tierFilter === "ALL" && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              Add Sponsor
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Sponsor Grid */}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paginatedSponsors.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card"
              >
                {/* Logo */}

                <div className="relative flex aspect-[2/1] items-center justify-center bg-slate-100 p-6 dark:bg-muted">
                  {item.logo ? (
                    <img
                      src={resolveMediaUrl(item.logo)}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-slate-300 dark:text-slate-600">
                      {item.name.charAt(0)}
                    </span>
                  )}

                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white dark:bg-blue-500/15 dark:text-blue-300">
                      {formatTier(item.tier)}
                    </span>
                  </div>

                  {item.featured && (
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.isActive
                          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-slate-100 text-slate-500 dark:bg-muted dark:text-slate-400"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-2">
                    {item.website ? (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Visit Website
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-50 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
                        title="Edit sponsor"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-border dark:text-red-400 dark:hover:bg-red-500/10"
                        title="Delete sponsor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSponsors.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:border dark:border-border dark:bg-card">
            <div className="border-b border-slate-200 p-6 dark:border-border">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {modalMode === "create"
                  ? "Add Sponsor"
                  : "Edit Sponsor"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add or update a Stream Nepal
                sponsor, partner, or collaborator.
              </p>
            </div>

            <form
              onSubmit={async (event) => {
                event.preventDefault();

                const form = new FormData(
                  event.currentTarget,
                );

                await handleSubmit({
                  name: String(form.get("name") || ""),

                  logo: logoUrl || undefined,

                  website:
                    String(form.get("website") || "") ||
                    undefined,

                  description:
                    String(form.get("description") || "") ||
                    undefined,

                  tier: (String(
                    form.get("tier") || "PARTNER",
                  ) || "PARTNER") as SponsorTier,

                  featured:
                    form.get("featured") === "on",

                  isActive: form.get("isActive") === "on",

                  displayOrder: Number(
                    form.get("displayOrder") || 0,
                  ),
                });
              }}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>

                <input
                  required
                  name="name"
                  defaultValue={selectedSponsor?.name ?? ""}
                  placeholder="Red Bull"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tier
                </label>

                <select
                  name="tier"
                  defaultValue={selectedSponsor?.tier ?? "PARTNER"}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
                >
                  {TIER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Logo
                </label>

                <ImageUpload
                  value={logoUrl}
                  folder="sponsors"
                  onChange={(result) =>
                    setLogoUrl(result?.url ?? "")
                  }
                />

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Upload the sponsor logo image.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Website URL
                </label>

                <input
                  type="url"
                  name="website"
                  defaultValue={selectedSponsor?.website ?? ""}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
                />

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Optional link visitors can click to reach
                  the sponsor.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  rows={4}
                  defaultValue={selectedSponsor?.description ?? ""}
                  placeholder="Short description..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  name="displayOrder"
                  defaultValue={selectedSponsor?.displayOrder ?? 0}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={selectedSponsor?.isActive ?? true}
                  />

                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Active
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={selectedSponsor?.featured ?? false}
                  />

                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Featured
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-border">
                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      setModalOpen(false);
                      setSelectedSponsor(null);
                    }
                  }}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-2 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-border dark:text-slate-300 dark:hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Add Sponsor"
                      : "Update Sponsor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
