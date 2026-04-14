import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { updateLeadStatus, updateLead } from "@/app/actions/leads";

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

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; edit?: string }>;
}) {
  const { id } = await params;
  const { error, edit } = await searchParams;
  const isEditing = edit === "true";

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/canvassing"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          &larr; Back to Canvassing
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {lead.homeowner_name}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[lead.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {statusLabels[lead.status] || lead.status}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Created {new Date(lead.created_at).toLocaleDateString()} at{" "}
          {new Date(lead.created_at).toLocaleTimeString()}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Quick status update */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Update Status
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusLabels).map(([value, label]) => (
            <form key={value} action={updateLeadStatus}>
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="status" value={value} />
              <button
                type="submit"
                disabled={lead.status === value}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  lead.status === value
                    ? "cursor-default bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Lead details — view or edit mode */}
      {isEditing ? (
        <form
          action={updateLead}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="id" value={lead.id} />

          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Homeowner Info
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="homeowner_name" className="block text-sm font-medium text-slate-700">
                  Name *
                </label>
                <input
                  id="homeowner_name"
                  name="homeowner_name"
                  type="text"
                  required
                  defaultValue={lead.homeowner_name}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={lead.phone || ""}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={lead.email || ""}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Property Address
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                  Street Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  defaultValue={lead.address}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  defaultValue={lead.city}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    defaultValue={lead.state}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="zip" className="block text-sm font-medium text-slate-700">
                    ZIP
                  </label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    defaultValue={lead.zip || ""}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={lead.notes || ""}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Save Changes
            </button>
            <Link
              href={`/dashboard/canvassing/${lead.id}`}
              className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Details</h2>
            <Link
              href={`/dashboard/canvassing/${lead.id}?edit=true`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </Link>
          </div>

          <dl className="space-y-4">
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Name</dt>
              <dd className="col-span-2 text-sm text-slate-900">
                {lead.homeowner_name}
              </dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Phone</dt>
              <dd className="col-span-2 text-sm text-slate-900">
                {lead.phone || "—"}
              </dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="col-span-2 text-sm text-slate-900">
                {lead.email || "—"}
              </dd>
            </div>
            <div className="border-t border-slate-100 pt-4 grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Address</dt>
              <dd className="col-span-2 text-sm text-slate-900">
                {lead.address}
                <br />
                {lead.city}, {lead.state} {lead.zip}
              </dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Source</dt>
              <dd className="col-span-2 text-sm capitalize text-slate-900">
                {lead.source}
              </dd>
            </div>
            {lead.notes && (
              <div className="border-t border-slate-100 pt-4 grid grid-cols-3">
                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                <dd className="col-span-2 whitespace-pre-wrap text-sm text-slate-900">
                  {lead.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
