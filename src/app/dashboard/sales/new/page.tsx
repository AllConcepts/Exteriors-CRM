import Link from "next/link";
import { createDeal } from "@/app/actions/deals";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Back to Pipeline
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">New Deal</h1>
        <p className="text-sm text-slate-600">Add a deal to your sales pipeline.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <form action={createDeal} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Info</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="contact_name" className="block text-sm font-medium text-slate-700">Contact Name *</label>
              <input id="contact_name" name="contact_name" type="text" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="John Smith" />
            </div>
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-slate-700">Phone</label>
              <input id="contact_phone" name="contact_phone" type="tel" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-slate-700">Email</label>
              <input id="contact_email" name="contact_email" type="email" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="john@email.com" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Property</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">Street Address *</label>
              <input id="address" name="address" type="text" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="123 Main St" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700">City *</label>
              <input id="city" name="city" type="text" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Dallas" />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="state" className="block text-sm font-medium text-slate-700">State</label>
                <input id="state" name="state" type="text" defaultValue="TX" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="w-1/2">
                <label htmlFor="zip" className="block text-sm font-medium text-slate-700">ZIP</label>
                <input id="zip" name="zip" type="text" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="75201" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Deal Details</h2>
          <div>
            <label htmlFor="deal_value" className="block text-sm font-medium text-slate-700">Deal Value ($)</label>
            <input id="deal_value" name="deal_value" type="number" step="0.01" min="0" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="15000" />
          </div>
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea id="notes" name="notes" rows={3} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Roof replacement, storm damage..." />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Create Deal</button>
          <Link href="/dashboard/sales" className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
