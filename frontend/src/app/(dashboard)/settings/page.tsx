import SettingsForm from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Website Settings
        </h1>

        <p className="mt-2 text-slate-500">
          Manage Stream Nepal's public website, branding,
          contact information and SEO.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
