"use client";

import { useEffect, useState } from "react";
import {
  Handshake,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import {
  createEventSponsor,
  deleteEventSponsor,
  updateEventSponsor,
} from "@/services/event-content";

import type {
  EventSponsor,
  EventSponsorTier,
} from "@/services/event";

import { getSponsors } from "@/services/sponsors";

import type { Sponsor } from "@/types/sponsors";

const TIER_OPTIONS: {
  value: EventSponsorTier;
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

function formatTier(tier: EventSponsorTier) {
  const option = TIER_OPTIONS.find(
    (item) => item.value === tier,
  );

  return option ? option.label : tier;
}

type EventSponsorsProps = {
  eventId: string;
  sponsors: EventSponsor[];
  onChange: (
    sponsors: EventSponsor[],
  ) => void;
};

export default function EventSponsors({
  eventId,
  sponsors,
  onChange,
}: EventSponsorsProps) {
  const [availableSponsors, setAvailableSponsors] =
    useState<Sponsor[]>([]);

  const [sponsorId, setSponsorId] =
    useState("");

  const [tier, setTier] =
    useState<EventSponsorTier>("PARTNER");

  const [featured, setFeatured] =
    useState(false);

  const [displayOrder, setDisplayOrder] =
    useState(0);

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  useEffect(() => {
    getSponsors()
      .then(setAvailableSponsors)
      .catch(() =>
        setAvailableSponsors([]),
      );
  }, []);

  const linkedIds = new Set(
    sponsors.map(
      (item) => item.sponsorId,
    ),
  );

  const selectableSponsors =
    availableSponsors.filter(
      (sponsor) => !linkedIds.has(sponsor.id),
    );

  function resetForm() {
    setSponsorId("");
    setTier("PARTNER");
    setFeatured(false);
    setDisplayOrder(0);
    setEditingId(null);
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!sponsorId) {
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const updated =
          await updateEventSponsor(
            eventId,
            editingId,
            {
              tier,
              featured,
              displayOrder,
            },
          );

        onChange(
          sponsors.map((item) =>
            item.id === editingId
              ? updated
              : item,
          ),
        );
      } else {
        const created =
          await createEventSponsor(
            eventId,
            {
              sponsorId,
              tier,
              featured,
              displayOrder,
            },
          );

        onChange([
          ...sponsors,
          created,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error(
        "Failed to save sponsor:",
        error,
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: EventSponsor) {
    setEditingId(item.id);
    setSponsorId(item.sponsorId);
    setTier(item.tier);
    setFeatured(item.featured);
    setDisplayOrder(item.displayOrder);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Remove this sponsor from the event?",
      )
    ) {
      return;
    }

    try {
      await deleteEventSponsor(
        eventId,
        id,
      );

      onChange(
        sponsors.filter(
          (item) => item.id !== id,
        ),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Failed to remove sponsor:",
        error,
      );
    }
  }

  async function toggleFeatured(
    item: EventSponsor,
  ) {
    try {
      const updated =
        await updateEventSponsor(
          eventId,
          item.id,
          {
            featured: !item.featured,
          },
        );

      onChange(
        sponsors.map((link) =>
          link.id === item.id
            ? updated
            : link,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to update sponsor:",
        error,
      );
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Handshake size={20} />

            <h2 className="font-semibold">
              {editingId
                ? "Edit Event Sponsor"
                : "Link a Sponsor"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <select
            required
            value={sponsorId}
            onChange={(e) =>
              setSponsorId(
                e.target.value,
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
          >
            <option value="">
              {editingId
                ? "Keep existing sponsor"
                : "Select a sponsor..."}
            </option>

            {editingId
              ? availableSponsors
                  .filter(
                    (sponsor) =>
                      sponsor.id ===
                      sponsorId,
                  )
                  .map((sponsor) => (
                    <option
                      key={sponsor.id}
                      value={sponsor.id}
                    >
                      {sponsor.name}
                    </option>
                  ))
              : selectableSponsors.map(
                  (sponsor) => (
                    <option
                      key={sponsor.id}
                      value={sponsor.id}
                    >
                      {sponsor.name}
                    </option>
                  ),
                )}

            {editingId &&
              !availableSponsors.some(
                (sponsor) =>
                  sponsor.id === sponsorId,
              ) && (
                <option value={sponsorId}>
                  {sponsors.find(
                    (item) =>
                      item.id === editingId,
                  )?.sponsor.name ??
                    "Current sponsor"}
                </option>
              )}
          </select>

          <select
            value={tier}
            onChange={(e) =>
              setTier(
                e.target
                  .value as EventSponsorTier,
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {TIER_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            value={displayOrder}
            onChange={(e) =>
              setDisplayOrder(
                Number(
                  e.target.value || 0,
                ),
              )
            }
            placeholder="Display order"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-slate-700"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) =>
                setFeatured(
                  e.target.checked,
                )
              }
            />

            <span className="text-sm">
              Featured
            </span>
          </label>
        </div>

        {selectableSponsors.length === 0 &&
          !editingId && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              All sponsors are already
              linked to this event. Add
              more sponsors first.
            </p>
          )}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {editingId ? (
            <Pencil size={16} />
          ) : (
            <Plus size={16} />
          )}

          {saving
            ? "Saving..."
            : editingId
              ? "Update Sponsor"
              : "Link Sponsor"}
        </button>
      </form>

      {sponsors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No sponsors linked to this event yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sponsors.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                  {item.sponsor.logo ? (
                    <img
                      src={item.sponsor.logo}
                      alt={item.sponsor.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">
                      {item.sponsor.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold">
                    {item.sponsor.name}
                  </h3>

                  <span className="mt-1 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    {formatTier(item.tier)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Order {item.displayOrder}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void toggleFeatured(
                        item,
                      )
                    }
                    className={`rounded-lg border border-slate-300 dark:border-slate-700 ${
                      item.featured
                        ? "text-amber-500"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                    title={
                      item.featured
                        ? "Remove featured"
                        : "Make featured"
                    }
                  >
                    <Star
                      size={15}
                      fill={
                        item.featured
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      startEdit(item)
                    }
                    className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void handleDelete(
                        item.id,
                      )
                    }
                    className="rounded-lg border border-slate-300 p-2 text-red-600 transition hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-500/10"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
