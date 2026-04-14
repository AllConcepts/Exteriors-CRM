import Link from "next/link";
import { createLead } from "@/app/actions/leads";

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          New Lead
        </h1>
        <p className="text-sm text-slate-600">
          Fill in the homeowner details from your canvassing visit.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Lead form */}
      <form
        action={createLead}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {/* Homeowner Info */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Homeowner Info
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="homeowner_name"
                className="block text-sm font-medium text-slate-700"
              >
                Homeowner Name *
              </label>
              <input
                id="homeowner_name"
                name="homeowner_name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="john@email.com"
              />
            </div>
          </div>
        </div>

        {/* Property Address */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Property Address
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-700"
              >
                Street Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-slate-700"
              >
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Dallas"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-slate-700"
                >
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  defaultValue="TX"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="zip"
                  className="block text-sm font-medium text-slate-700"
                >
                  ZIP
                </label>
                <input
                  id="zip"
                  name="zip"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="75201"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-slate-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Roof damage visible, missing shingles on south side..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Save Lead
          </button>
          <Link
            href="/dashboard/canvassing"
            className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
