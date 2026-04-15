import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Status badge colors
const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  appointment_set: "bg-green-100 text-green-700",
  not_interested: "bg-red-100 text-red-700",
  not_home: "bg-slate-100 text-slate-700",
  sold: "bg-emerald-100 text-emerald-700",
};

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  appointment_set: "Appointment Set",
  not_interested: "Not Interested",
  not_home: "Not Home",
  sold: "Sold",
};

export default async function CanvassingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const supabase = await createClient();

  // Fetch leads, optionally filtered by status
  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data: leads, error } = await query;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Canvassing</h1>
          <p className="text-sm text-slate-600">
            Door-to-door leads — {leads?.length ?? 0} total
          </p>
        </div>
        <Link
          href="/dashboard/canvassing/new"
          className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          + New Lead
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/dashboard/canvassing"
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            !filterStatus
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </Link>
        {Object.entries(statusLabels).map(([value, label]) => (
          <Link
            key={value}
            href={`/dashboard/canvassing?status=${value}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              filterStatus === value
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {/* Leads table */}
      {leads && leads.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Address
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Phone</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/canvassing/${lead.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {lead.homeowner_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.address}, {lead.city}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[lead.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            No leads yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Start canvassing and create your first lead.
          </p>
          <Link
            href="/dashboard/canvassing/new"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            + New Lead
          </Link>
        </div>
      )}
    </div>
  );
}
