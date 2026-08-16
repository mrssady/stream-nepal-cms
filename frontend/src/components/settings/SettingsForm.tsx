"use client";

import { useEffect, useState } from "react";

import ImageUpload from "@/components/media/ImageUpload";
import {
  createSettings,
  getSettings,
  updateSettings,
} from "@/services/settings";

import type {
  UpdateWebsiteSetting,
  WebsiteSetting,
} from "@/types/settings";

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  const err = error as {
    response?: {
      data?: { message?: string };
    };
    message?: string;
  };

  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

const emptySettings: UpdateWebsiteSetting = {
  companyName: "Stream Nepal",
  tagline: "",

  logo: "",
  favicon: "",

  email: "",
  phone: "",
  alternatePhone: "",

  address: "",
  city: "",
  country: "Nepal",

  website: "",

  facebook: "",
  instagram: "",
  youtube: "",
  discord: "",
  tiktok: "",
  linkedin: "",

  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",

  footerText: "",
  copyrightText: "",
};

export default function SettingsForm() {
  const [form, setForm] =
    useState<UpdateWebsiteSetting>(
      emptySettings,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [hasSettings, setHasSettings] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    getSettings()
      .then((settings) => {
        setForm({
          companyName:
            settings.companyName ?? "",
          tagline:
            settings.tagline ?? "",

          logo:
            settings.logo ?? "",
          favicon:
            settings.favicon ?? "",

          email:
            settings.email ?? "",
          phone:
            settings.phone ?? "",
          alternatePhone:
            settings.alternatePhone ?? "",

          address:
            settings.address ?? "",
          city:
            settings.city ?? "",
          country:
            settings.country ?? "",

          website:
            settings.website ?? "",

          facebook:
            settings.facebook ?? "",
          instagram:
            settings.instagram ?? "",
          youtube:
            settings.youtube ?? "",
          discord:
            settings.discord ?? "",
          tiktok:
            settings.tiktok ?? "",
          linkedin:
            settings.linkedin ?? "",

          seoTitle:
            settings.seoTitle ?? "",
          seoDescription:
            settings.seoDescription ?? "",
          seoKeywords:
            settings.seoKeywords ?? "",

          footerText:
            settings.footerText ?? "",
          copyrightText:
            settings.copyrightText ?? "",
        });

        setHasSettings(true);
      })
      .catch((error: unknown) => {
        const status = (
          error as {
            response?: { status?: number };
          }
        )?.response?.status;

        if (status === 404) {
          setHasSettings(false);
        } else {
          setError(
            getErrorMessage(
              error,
              "Failed to load website settings.",
            ),
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function updateField(
    field: keyof UpdateWebsiteSetting,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let result: WebsiteSetting;

      if (hasSettings) {
        result =
          await updateSettings(form);
      } else {
        result =
          await createSettings(form);
      }

      setHasSettings(true);

      setForm((current) => ({
        ...current,
        ...result,
      }));

      setSuccess(
        "Website settings saved successfully.",
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "Failed to save website settings.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-border dark:bg-card">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading website settings...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
          {success}
        </div>
      )}

      {/* BRANDING */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Branding
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage the public identity of Stream Nepal.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Company Name
            </label>

            <input
              required
              value={form.companyName}
              onChange={(e) =>
                updateField(
                  "companyName",
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tagline
            </label>

            <input
              value={form.tagline}
              onChange={(e) =>
                updateField(
                  "tagline",
                  e.target.value,
                )
              }
              placeholder="Esports, broadcast and event production."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">
              Logo
            </label>

            <ImageUpload
              value={form.logo}
              folder="settings"
              onChange={(result) =>
                updateField(
                  "logo",
                  result?.url ?? "",
                )
              }
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">
              Favicon
            </label>

            <ImageUpload
              value={form.favicon}
              folder="settings"
              onChange={(result) =>
                updateField(
                  "favicon",
                  result?.url ?? "",
                )
              }
            />
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Contact Information
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Information displayed on the public website.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Email"
            value={form.email}
            onChange={(value) =>
              updateField("email", value)
            }
          />

          <Field
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              updateField("phone", value)
            }
          />

          <Field
            label="Alternate Phone"
            value={form.alternatePhone}
            onChange={(value) =>
              updateField(
                "alternatePhone",
                value,
              )
            }
          />

          <Field
            label="Website"
            value={form.website}
            onChange={(value) =>
              updateField("website", value)
            }
          />

          <Field
            label="Address"
            value={form.address}
            onChange={(value) =>
              updateField("address", value)
            }
          />

          <Field
            label="City"
            value={form.city}
            onChange={(value) =>
              updateField("city", value)
            }
          />

          <Field
            label="Country"
            value={form.country}
            onChange={(value) =>
              updateField("country", value)
            }
          />
        </div>
      </section>

      {/* SOCIAL */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Social Media
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add the official Stream Nepal social profiles.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Facebook"
            value={form.facebook}
            onChange={(value) =>
              updateField("facebook", value)
            }
          />

          <Field
            label="Instagram"
            value={form.instagram}
            onChange={(value) =>
              updateField("instagram", value)
            }
          />

          <Field
            label="YouTube"
            value={form.youtube}
            onChange={(value) =>
              updateField("youtube", value)
            }
          />

          <Field
            label="Discord"
            value={form.discord}
            onChange={(value) =>
              updateField("discord", value)
            }
          />

          <Field
            label="TikTok"
            value={form.tiktok}
            onChange={(value) =>
              updateField("tiktok", value)
            }
          />

          <Field
            label="LinkedIn"
            value={form.linkedin}
            onChange={(value) =>
              updateField("linkedin", value)
            }
          />
        </div>
      </section>

      {/* SEO */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            SEO
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search engine metadata for the public website.
          </p>
        </div>

        <div className="space-y-6">
          <Field
            label="SEO Title"
            value={form.seoTitle}
            onChange={(value) =>
              updateField(
                "seoTitle",
                value,
              )
            }
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              SEO Description
            </label>

            <textarea
              value={form.seoDescription}
              onChange={(e) =>
                updateField(
                  "seoDescription",
                  e.target.value,
                )
              }
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
            />
          </div>

          <Field
            label="SEO Keywords"
            value={form.seoKeywords}
            onChange={(value) =>
              updateField(
                "seoKeywords",
                value,
              )
            }
          />
        </div>
      </section>

      {/* FOOTER */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Footer
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Footer Text
            </label>

            <textarea
              value={form.footerText}
              onChange={(e) =>
                updateField(
                  "footerText",
                  e.target.value,
                )
              }
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
            />
          </div>

          <Field
            label="Copyright Text"
            value={form.copyrightText}
            onChange={(value) =>
              updateField(
                "copyrightText",
                value,
              )
            }
          />
        </div>
      </section>

      {/* SAVE */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          {saving
            ? "Saving..."
            : hasSettings
              ? "Save Changes"
              : "Create Website Settings"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 dark:border-border dark:bg-muted dark:text-white"
      />
    </div>
  );
}