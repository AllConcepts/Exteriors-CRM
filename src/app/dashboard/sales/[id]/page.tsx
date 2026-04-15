import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { updateDealStage, updateDeal } from "@/app/actions/deals";
import { DEAL_STAGES, type DealStage } from "@/lib/deal-stages";

export default async function DealDetailPage({
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
  const { data: deal } = await supabase.from("deals").select("*").eq("id", id).single();

  if (!deal) notFound();

  const stageConfig = DEAL_STAGES[deal.stage as DealStage] || DEAL_STAGES.new_lead;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Back to Pipeline
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{deal.contact_name}</h1>
          <span className="rounded-full px-3 py-1 text-sm font-medium text-white" style={{ background: stageConfig.color }}>
            {stageConfig.label}
          </span>
        </div>
        <p className="text-sm text-slate-500">{deal.address}, {deal.city}, {deal.state} {deal.zip}</p>
        {deal.deal_value && (
          <p className="mt-1 text-lg font-bold" style={{ color: stageConfig.color }}>${Number(deal.deal_value).toLocaleString()}</p>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Pipeline Stage Controls */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Move to Stage</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DEAL_STAGES).map(([key, config]) => (
            <form key={key} action={updateDealStage}>
              <input type="hidden" name="id" value={deal.id} />
              <input type="hidden" name="stage" value={key} />
              <button
                type="submit"
                disabled={deal.stage === key}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  deal.stage === key
                    ? "text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={deal.stage === key ? { background: config.color } : undefined}
              >
                {config.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Deal details */}
      {isEditing ? (
        <form action={updateDeal} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <input type="hidden" name="id" value={deal.id} />
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Info</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="contact_name" className="block text-sm font-medium text-slate-700">Name *</label>
                <input id="contact_name" name="contact_name" type="text" required defaultValue={deal.contact_name} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-slate-700">Phone</label>
                <input id="contact_phone" name="contact_phone" type="tel" defaultValue={deal.contact_phone || ""} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-slate-700">Email</label>
                <input id="contact_email" name="contact_email" type="email" defaultValue={deal.contact_email || ""} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Property</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address *</label>
                <input id="address" name="address" type="text" required defaultValue={deal.address} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700">City *</label>
                <input id="city" name="city" type="text" required defaultValue={deal.city} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700">State</label>
                  <input id="state" name="state" type="text" defaultValue={deal.state} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="w-1/2">
                  <label htmlFor="zip" className="block text-sm font-medium text-slate-700">ZIP</label>
                  <input id="zip" name="zip" type="text" defaultValue={deal.zip || ""} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="deal_value" className="block text-sm font-medium text-slate-700">Deal Value ($)</label>
            <input id="deal_value" name="deal_value" type="number" step="0.01" min="0" defaultValue={deal.deal_value || ""} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={deal.notes || ""} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Save Changes</button>
            <Link href={`/dashboard/sales/${deal.id}`} className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Cancel</Link>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Deal Details</h2>
            <Link href={`/dashboard/sales/${deal.id}?edit=true`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</Link>
          </div>
          <dl className="space-y-4">
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Contact</dt>
              <dd className="col-span-2 text-sm text-slate-900">{deal.contact_name}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Phone</dt>
              <dd className="col-span-2 text-sm text-slate-900">{deal.contact_phone || "—"}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="col-span-2 text-sm text-slate-900">{deal.contact_email || "—"}</dd>
            </div>
            <div className="border-t border-slate-100 pt-4 grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Address</dt>
              <dd className="col-span-2 text-sm text-slate-900">{deal.address}<br />{deal.city}, {deal.state} {deal.zip}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Deal Value</dt>
              <dd className="col-span-2 text-sm font-semibold text-slate-900">{deal.deal_value ? `$${Number(deal.deal_value).toLocaleString()}` : "—"}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm font-medium text-slate-500">Created</dt>
              <dd className="col-span-2 text-sm text-slate-900">{new Date(deal.created_at).toLocaleDateString()}</dd>
            </div>
            {deal.notes && (
              <div className="border-t border-slate-100 pt-4 grid grid-cols-3">
                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                <dd className="col-span-2 whitespace-pre-wrap text-sm text-slate-900">{deal.notes}</dd>
              </div>
            )}
            {deal.lost_reason && (
              <div className="grid grid-cols-3">
                <dt className="text-sm font-medium text-red-500">Lost Reason</dt>
                <dd className="col-span-2 text-sm text-red-700">{deal.lost_reason}</dd>
              </div>
            )}
            {deal.lead_id && (
              <div className="border-t border-slate-100 pt-4 grid grid-cols-3">
                <dt className="text-sm font-medium text-slate-500">Source</dt>
                <dd className="col-span-2">
                  <Link href={`/dashboard/canvassing/${deal.lead_id}`} className="text-sm text-blue-600 hover:text-blue-800">View original lead &rarr;</Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
