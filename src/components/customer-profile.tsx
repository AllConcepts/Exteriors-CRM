"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { JOB_STAGES } from "@/lib/job-stages";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

const TABS = ["Activity", "Jobs", "Financials"] as const;
const FIN_TABS = ["Estimates", "Material Orders", "Invoices", "Payments"] as const;

const ACTIVITY_TYPES = [
  { value: "note", label: "Note", icon: "📝" },
  { value: "call", label: "Call", icon: "📞" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "meeting", label: "Meeting", icon: "🤝" },
  { value: "other", label: "Other", icon: "📌" },
];

export default function CustomerProfile({ contactId }: { contactId: string }) {
  const [contact, setContact] = useState<AnyRecord | null>(null);
  const [tab, setTab] = useState<typeof TABS[number]>("Activity");
  const [finTab, setFinTab] = useState<typeof FIN_TABS[number]>("Estimates");
  const [jobs, setJobs] = useState<AnyRecord[]>([]);
  const [estimates, setEstimates] = useState<AnyRecord[]>([]);
  const [orders, setOrders] = useState<AnyRecord[]>([]);
  const [invoices, setInvoices] = useState<AnyRecord[]>([]);
  const [payments, setPayments] = useState<AnyRecord[]>([]);
  const [activities, setActivities] = useState<AnyRecord[]>([]);
  const [editing, setEditing] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const supabase = createClient();

  const fetchContact = useCallback(async () => {
    const res = await fetch(`/api/contacts?id=${contactId}`);
    setContact(await res.json());
  }, [contactId]);

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase.from("jobs").select("*").eq("contact_id", contactId).order("created_at", { ascending: false });
    setJobs(data || []);
  }, [contactId, supabase]);

  const fetchEstimates = useCallback(async () => {
    const jobIds = jobs.map(j => j.id);
    if (jobIds.length === 0) { setEstimates([]); return; }
    const { data } = await supabase.from("estimates").select("*, jobs(customer_name, address)").in("job_id", jobIds).order("created_at", { ascending: false });
    setEstimates(data || []);
  }, [jobs, supabase]);

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`/api/material-orders?contact_id=${contactId}`);
    setOrders(await res.json());
  }, [contactId]);

  const fetchInvoices = useCallback(async () => {
    const res = await fetch(`/api/invoices?contact_id=${contactId}`);
    setInvoices(await res.json());
  }, [contactId]);

  const fetchPayments = useCallback(async () => {
    const res = await fetch(`/api/payments?contact_id=${contactId}`);
    setPayments(await res.json());
  }, [contactId]);

  const fetchActivities = useCallback(async () => {
    const res = await fetch(`/api/activity?contact_id=${contactId}`);
    setActivities(await res.json());
  }, [contactId]);

  useEffect(() => { fetchContact(); fetchJobs(); fetchActivities(); }, [fetchContact, fetchJobs, fetchActivities]);
  useEffect(() => { fetchEstimates(); }, [fetchEstimates]);
  useEffect(() => {
    if (tab === "Financials") { fetchOrders(); fetchInvoices(); fetchPayments(); }
  }, [tab, fetchOrders, fetchInvoices, fetchPayments]);

  const saveContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: contactId,
        name: fd.get("name"),
        phone: fd.get("phone") || null,
        email: fd.get("email") || null,
        address: fd.get("address") || null,
        city: fd.get("city") || null,
        state: fd.get("state") || null,
        zip: fd.get("zip") || null,
        notes: fd.get("notes") || null,
      }),
    });
    setEditing(false);
    fetchContact();
  };

  const addActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_id: contactId,
        activity_type: fd.get("activity_type"),
        title: fd.get("title"),
        description: fd.get("description") || null,
      }),
    });
    setShowActivityForm(false);
    fetchActivities();
  };

  if (!contact) return <div className="flex h-64 items-center justify-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Customer Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {editing ? (
          <form onSubmit={saveContact} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600">Name *</label>
                <input name="name" required defaultValue={contact.name} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div><label className="block text-xs font-medium text-slate-600">Phone</label><input name="phone" defaultValue={contact.phone || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-slate-600">Email</label><input name="email" type="email" defaultValue={contact.email || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
              <div className="col-span-2"><label className="block text-xs font-medium text-slate-600">Address</label><input name="address" defaultValue={contact.address || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-slate-600">City</label><input name="city" defaultValue={contact.city || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
              <div className="flex gap-2">
                <div className="w-1/2"><label className="block text-xs font-medium text-slate-600">State</label><input name="state" defaultValue={contact.state || "TX"} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
                <div className="w-1/2"><label className="block text-xs font-medium text-slate-600">ZIP</label><input name="zip" defaultValue={contact.zip || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
              </div>
              <div className="col-span-2"><label className="block text-xs font-medium text-slate-600">Notes</label><textarea name="notes" rows={2} defaultValue={contact.notes || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                {contact.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{contact.name}</h1>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {contact.phone && <span>{contact.phone}</span>}
                  {contact.email && <span>{contact.email}</span>}
                </div>
                {contact.address && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    {contact.address}, {contact.city}, {contact.state} {contact.zip}
                  </p>
                )}
                {contact.notes && <p className="mt-2 text-sm text-slate-500 italic">{contact.notes}</p>}
              </div>
            </div>
            <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4">
          <div className="rounded-lg bg-blue-50 px-4 py-2"><span className="block text-xs text-blue-600">Jobs</span><span className="text-lg font-bold text-blue-700">{jobs.length}</span></div>
          <div className="rounded-lg bg-green-50 px-4 py-2"><span className="block text-xs text-green-600">Estimates</span><span className="text-lg font-bold text-green-700">{estimates.length}</span></div>
          <div className="rounded-lg bg-amber-50 px-4 py-2"><span className="block text-xs text-amber-600">Invoices</span><span className="text-lg font-bold text-amber-700">{invoices.length}</span></div>
          <div className="rounded-lg bg-purple-50 px-4 py-2"><span className="block text-xs text-purple-600">Payments</span><span className="text-lg font-bold text-purple-700">{payments.length}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium ${tab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ============= ACTIVITY TAB ============= */}
      {tab === "Activity" && (
        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
            <button onClick={() => setShowActivityForm(!showActivityForm)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Log Activity</button>
          </div>
          {showActivityForm && (
            <form onSubmit={addActivity} className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div className="flex gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Type</label>
                  <select name="activity_type" className="mt-0.5 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    {ACTIVITY_TYPES.map((a) => <option key={a.value} value={a.value}>{a.icon} {a.label}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600">Title *</label>
                  <input name="title" required className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Called customer about estimate" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Description</label>
                <textarea name="description" rows={2} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
            </form>
          )}
          <div className="space-y-3">
            {activities.map((a) => {
              const typeInfo = ACTIVITY_TYPES.find((t) => t.value === a.activity_type);
              return (
                <div key={a.id} className="flex gap-3 rounded-lg border border-slate-100 bg-white p-3">
                  <span className="text-lg">{typeInfo?.icon || "📌"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{a.title}</p>
                    {a.description && <p className="mt-0.5 text-xs text-slate-500">{a.description}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && <p className="text-center text-sm text-slate-400 py-8">No activity logged yet</p>}
          </div>
        </div>
      )}

      {/* ============= JOBS TAB ============= */}
      {tab === "Jobs" && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Jobs ({jobs.length})</h2>
          {jobs.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Address</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Stage</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Value</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Rep</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => {
                    const stage = JOB_STAGES[job.stage as keyof typeof JOB_STAGES];
                    return (
                      <tr key={job.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <a href={`/dashboard/sales`} className="font-medium text-slate-900 hover:text-blue-600">{job.address}, {job.city}</a>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ background: stage?.color || "#94a3b8" }}>{stage?.label || job.stage}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">{job.job_value ? `$${Number(job.job_value).toLocaleString()}` : "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{job.assigned_rep || "—"}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(job.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center text-sm text-slate-400 py-8">No jobs for this customer</p>}
        </div>
      )}

      {/* ============= FINANCIALS TAB ============= */}
      {tab === "Financials" && (
        <div>
          {/* Financial sub-tabs */}
          <div className="mb-4 flex gap-1">
            {FIN_TABS.map((ft) => (
              <button key={ft} onClick={() => setFinTab(ft)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${finTab === ft ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {ft}
              </button>
            ))}
          </div>

          {/* ESTIMATES */}
          {finTab === "Estimates" && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Estimate #</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Related Job</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Value</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Signature</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {estimates.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{e.estimate_number}</td>
                      <td className="px-4 py-3 text-slate-600">{e.jobs?.address || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">${Number(e.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.signed_at ? "bg-green-100 text-green-700" : e.status === "sent" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                          {e.signed_at ? "Signed" : e.status === "sent" ? "Requested" : "Not Requested"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.status === "sent" || e.status === "signed" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                          {e.status === "draft" ? "Draft" : "Sent"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {estimates.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No estimates</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* MATERIAL ORDERS */}
          {finTab === "Material Orders" && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Order #</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Related Job</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Order Date</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{o.order_number}</td>
                      <td className="px-4 py-3 text-slate-600">{o.jobs?.address || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{o.order_date ? new Date(o.order_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.status === "ordered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {o.status === "ordered" ? "Ordered" : "Not Ordered"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No material orders</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* INVOICES */}
          {finTab === "Invoices" && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Invoice #</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Related Job</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Paid</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Due</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-slate-600">{inv.jobs?.address || "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">${Number(inv.invoice_total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-green-700">${Number(inv.total_paid || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">${Number(inv.total_due || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === "sent" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                          {inv.status === "sent" ? "Sent" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No invoices</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* PAYMENTS */}
          {finTab === "Payments" && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Reference #</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Invoice #</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Method</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Related Job</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.reference_number || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-700">${Number(p.payment_amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{p.invoices?.invoice_number || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{p.payment_method?.replace("_", " ") || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{p.jobs?.customer_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "collected" ? "bg-green-100 text-green-700" :
                          p.status === "pending" ? "bg-amber-100 text-amber-700" :
                          p.status === "returned" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No payments</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
