import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Website Settings
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Manage Stream Nepal&apos;s public website, branding,
          contact information and SEO.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
