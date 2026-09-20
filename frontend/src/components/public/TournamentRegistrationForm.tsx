"use client";

import { useState } from "react";

import {
  submitPublicTournamentRegistration,
  type PublicTournamentDetail,
} from "@/services/public";

type RegistrationFormProps = {
  tournament: PublicTournamentDetail;
};

export default function TournamentRegistrationForm({
  tournament,
}: RegistrationFormProps) {
  const [form, setForm] = useState({
    teamName: "",
    captainName: "",
    captainEmail: "",
    captainPhone: "",
    managerName: "",
    managerPhone: "",
    discordUsername: "",
    gameUID: "",
    gameIGN: "",
    rosterSize: "4",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await submitPublicTournamentRegistration(
        tournament.slug,
        {
          teamName: form.teamName.trim(),
          captainName: form.captainName.trim(),
          captainEmail: form.captainEmail.trim(),
          captainPhone: form.captainPhone.trim(),
          managerName: form.managerName.trim() || undefined,
          managerPhone: form.managerPhone.trim() || undefined,
          discordUsername: form.discordUsername.trim() || undefined,
          gameUID: form.gameUID.trim(),
          gameIGN: form.gameIGN.trim(),
          rosterSize: Number(form.rosterSize) || 4,
        },
      );

      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed";

      setError(
        message.includes("409")
          ? "A team with this name has already registered."
          : message,
      );

      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-4xl">✓</div>
        <h3 className="mt-4 text-xl font-bold text-emerald-900">
          Registration submitted!
        </h3>
        <p className="mt-2 text-sm leading-6 text-emerald-700">
          Thank you, {form.captainName}. Your team{" "}
          <span className="font-semibold">
            {form.teamName}
          </span>{" "}
          has been registered for{" "}
          <span className="font-semibold">
            {tournament.name}
          </span>
          . Our team will review your application and
          confirm your slot shortly.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-950">
        Register your team
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Fill in the captain and team details below.
        Registration is confirmed after review by our
        admin team.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label className={labelClass}>
            Team Name
          </label>

          <input
            name="teamName"
            value={form.teamName}
            onChange={handleChange}
            placeholder="Team Name"
            required
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Captain Name
            </label>

            <input
              name="captainName"
              value={form.captainName}
              onChange={handleChange}
              placeholder="Captain name"
              required
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Captain Email
            </label>

            <input
              type="email"
              name="captainEmail"
              value={form.captainEmail}
              onChange={handleChange}
              placeholder="captain@example.com"
              required
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Captain Phone
            </label>

            <input
              name="captainPhone"
              value={form.captainPhone}
              onChange={handleChange}
              placeholder="98XXXXXXXX"
              required
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Game UID
            </label>

            <input
              name="gameUID"
              value={form.gameUID}
              onChange={handleChange}
              placeholder="In-game player ID"
              required
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Game IGN
            </label>

            <input
              name="gameIGN"
              value={form.gameIGN}
              onChange={handleChange}
              placeholder="In-game name"
              required
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Roster Size
            </label>

            <input
              type="number"
              name="rosterSize"
              min={1}
              max={10}
              value={form.rosterSize}
              onChange={handleChange}
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Manager Name
            </label>

            <input
              name="managerName"
              value={form.managerName}
              onChange={handleChange}
              placeholder="Optional"
              disabled={loading}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Manager Phone
            </label>

            <input
              name="managerPhone"
              value={form.managerPhone}
              onChange={handleChange}
              placeholder="Optional"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Discord Username
          </label>

          <input
            name="discordUsername"
            value={form.discordUsername}
            onChange={handleChange}
            placeholder="Optional"
            disabled={loading}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Submitting..."
            : "Submit Registration"}
        </button>
      </form>
    </div>
  );
}