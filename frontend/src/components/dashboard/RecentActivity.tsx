import {
  UserPlus,
  Trophy,
  Users,
} from "lucide-react";

const activities = [
  {
    title: "New user registered",
    description: "Admin created a new user.",
    icon: UserPlus,
  },
  {
    title: "Tournament created",
    description: "PUBG Championship 2026",
    icon: Trophy,
  },
  {
    title: "Team joined",
    description: "Team Alpha joined the event.",
    icon: Users,
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-start gap-4"
            >
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Icon size={20} />
              </div>

              <div>
                <h3 className="font-medium">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}