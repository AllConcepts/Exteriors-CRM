import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Quick-access cards for each section of the platform
const modules = [
  {
    title: "Onboarding",
    description:
      "New hire training, onboarding checklists, and training videos for your team.",
    href: "/dashboard/onboarding",
    color: "bg-emerald-500",
    icon: (
      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "Canvassing",
    description:
      "Door-to-door lead generation. Create leads that auto-populate into Sales CRM.",
    href: "/dashboard/canvassing",
    color: "bg-orange-500",
    icon: (
      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Sales CRM",
    description:
      "Manage leads, track deals through your pipeline, and close sales. Like JobNimbus & AccuLynx.",
    href: "/dashboard/sales",
    color: "bg-blue-500",
    icon: (
      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Operations",
    description:
      "Jobs, work orders, material lists, and crew photo access. Manage active projects.",
    href: "/dashboard/operations",
    color: "bg-purple-500",
    icon: (
      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: "Leadership",
    description:
      "Team performance, KPIs, reports, and management tools for company leaders.",
    href: "/dashboard/leadership",
    color: "bg-amber-500",
    icon: (
      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Team Member";

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-slate-600">
          Here&apos;s your business platform overview.
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {modules.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${mod.color}`}
              >
                {mod.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                  {mod.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {mod.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick stats placeholder */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Quick Stats
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Leads", value: "—", color: "text-orange-600" },
            { label: "Open Deals", value: "—", color: "text-blue-600" },
            { label: "Active Jobs", value: "—", color: "text-purple-600" },
            { label: "Team Members", value: "—", color: "text-emerald-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-600">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
