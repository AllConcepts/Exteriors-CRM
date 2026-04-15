"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type Estimate,
  type EstimateGroup,
  type EstimateLineItem,
  type EstimateVariation,
  calcLineItemTotal,
  UNITS,
} from "@/lib/estimate-types";

// ============================================================================
// LINE ITEM VARIATION ROW
// ============================================================================
function VariationRow({
  variation,
  onUpdate,
  onDelete,
  onSelect,
}: {
  variation: EstimateVariation;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="ml-6 flex items-center gap-2 rounded border border-slate-100 bg-slate-50 px-2 py-1.5">
      <button
        onClick={() => onSelect(variation.id)}
        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
          variation.is_selected ? "border-blue-500 bg-blue-500" : "border-slate-300"
        }`}
        title={variation.is_selected ? "Selected" : "Click to select"}
      />
      <input
        value={variation.name}
        onChange={(e) => onUpdate(variation.id, "name", e.target.value)}
        className="w-28 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
        placeholder="Variation name"
      />
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-400">Mat$</span>
        <input
          type="number" step="0.01" value={variation.material_cost}
          onChange={(e) => onUpdate(variation.id, "material_cost", parseFloat(e.target.value) || 0)}
          className="w-16 rounded border border-slate-200 px-1.5 py-1 text-xs focus:border-blue-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-400">Lab$</span>
        <input
          type="number" step="0.01" value={variation.labor_cost}
          onChange={(e) => onUpdate(variation.id, "labor_cost", parseFloat(e.target.value) || 0)}
          className="w-16 rounded border border-slate-200 px-1.5 py-1 text-xs focus:border-blue-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-400">Margin%</span>
        <input
          type="number" step="1" value={variation.profit_margin}
          onChange={(e) => onUpdate(variation.id, "profit_margin", parseFloat(e.target.value) || 0)}
          className="w-14 rounded border border-slate-200 px-1.5 py-1 text-xs focus:border-blue-400 focus:outline-none"
        />
      </div>
      <button onClick={() => onDelete(variation.id)} className="ml-auto text-red-400 hover:text-red-600">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

// ============================================================================
// LINE ITEM ROW
// ============================================================================
function LineItemRow({
  item,
  onUpdate,
  onDelete,
  onAddVariation,
  onUpdateVariation,
  onDeleteVariation,
  onSelectVariation,
}: {
  item: EstimateLineItem;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onDelete: (id: string) => void;
  onAddVariation: (lineItemId: string) => void;
  onUpdateVariation: (id: string, field: string, value: unknown) => void;
  onDeleteVariation: (id: string) => void;
  onSelectVariation: (id: string, lineItemId: string) => void;
}) {
  const total = calcLineItemTotal(item);
  const [showVariations, setShowVariations] = useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        {/* Name */}
        <input
          value={item.name}
          onChange={(e) => onUpdate(item.id, "name", e.target.value)}
          className="w-40 rounded border border-slate-200 px-2 py-1.5 text-sm font-medium focus:border-blue-400 focus:outline-none"
          placeholder="Item name"
        />
        {/* Material cost */}
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400">Material $</span>
          <input
            type="number" step="0.01" value={item.material_cost}
            onChange={(e) => onUpdate(item.id, "material_cost", parseFloat(e.target.value) || 0)}
            className="w-20 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
          />
        </div>
        {/* Labor cost */}
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400">Labor $</span>
          <input
            type="number" step="0.01" value={item.labor_cost}
            onChange={(e) => onUpdate(item.id, "labor_cost", parseFloat(e.target.value) || 0)}
            className="w-20 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
          />
        </div>
        {/* Margin */}
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400">Margin %</span>
          <input
            type="number" step="1" value={item.profit_margin}
            onChange={(e) => onUpdate(item.id, "profit_margin", parseFloat(e.target.value) || 0)}
            className="w-16 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
          />
        </div>
        {/* Qty */}
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400">Qty</span>
          <input
            type="number" step="0.01" value={item.quantity}
            onChange={(e) => onUpdate(item.id, "quantity", parseFloat(e.target.value) || 0)}
            className="w-16 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none"
          />
        </div>
        {/* Unit */}
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400">Unit</span>
          <select
            value={item.unit}
            onChange={(e) => onUpdate(item.id, "unit", e.target.value)}
            className="w-20 rounded border border-slate-200 px-1 py-1 text-xs focus:border-blue-400 focus:outline-none"
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {/* Total */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-slate-400">Total</span>
          <span className="text-sm font-bold text-green-700">${total.toFixed(2)}</span>
        </div>
        {/* Actions */}
        <div className="ml-2 flex gap-1">
          <button
            onClick={() => setShowVariations(!showVariations)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Variations"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </button>
          <button onClick={() => onDelete(item.id)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <input
        value={item.description || ""}
        onChange={(e) => onUpdate(item.id, "description", e.target.value || null)}
        className="ml-3 w-full rounded border border-slate-100 px-2 py-1 text-xs text-slate-500 placeholder-slate-300 focus:border-blue-400 focus:outline-none"
        placeholder="Description (optional)"
      />

      {/* Variations */}
      {showVariations && (
        <div className="space-y-1 pb-2">
          {(item.variations || []).map((v) => (
            <VariationRow
              key={v.id}
              variation={v}
              onUpdate={onUpdateVariation}
              onDelete={onDeleteVariation}
              onSelect={(id) => onSelectVariation(id, item.id)}
            />
          ))}
          <button
            onClick={() => onAddVariation(item.id)}
            className="ml-6 rounded border border-dashed border-slate-300 px-2 py-1 text-[10px] font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            + Add Variation
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN ESTIMATE BUILDER
// ============================================================================
export default function EstimateBuilder({ jobId, job }: { jobId: string; job: { customer_name: string; address: string; city: string; state: string; zip: string | null } }) {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [groups, setGroups] = useState<EstimateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalMargin, setGlobalMargin] = useState(20);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryItems, setLibraryItems] = useState<{id:string;name:string;description:string|null;material_cost:number;labor_cost:number;profit_margin:number;unit:string;category:string}[]>([]);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCategory, setLibraryCategory] = useState<string | null>(null);
  const [addToGroupId, setAddToGroupId] = useState<string | null>(null);
  const supabase = createClient();

  // Load or create estimate
  const loadEstimate = useCallback(async () => {
    // Check if estimate exists for this job
    const res = await fetch(`/api/estimates?job_id=${jobId}`);
    const estimates = await res.json();

    if (estimates.length > 0) {
      // Load existing estimate
      const detailRes = await fetch(`/api/estimates?id=${estimates[0].id}`);
      const full = await detailRes.json();
      setEstimate(full);
      setGroups(full.groups || []);
    } else {
      // Create new estimate
      const createRes = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          customer_name: job.customer_name,
          address: job.address,
          city: job.city,
          state: job.state,
          zip: job.zip,
        }),
      });
      const newEstimate = await createRes.json();
      setEstimate(newEstimate);
      setGroups([]);
    }
    setLoading(false);
  }, [jobId, job, supabase]);

  useEffect(() => { loadEstimate(); }, [loadEstimate]);

  // Reload full estimate data
  const reload = async () => {
    if (!estimate) return;
    const res = await fetch(`/api/estimates?id=${estimate.id}`);
    const full = await res.json();
    setEstimate(full);
    setGroups(full.groups || []);
  };

  // ---- GROUP ACTIONS ----
  const addGroup = async () => {
    if (!estimate) return;
    const res = await fetch("/api/estimates/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estimate_id: estimate.id, name: "New Group", sort_order: groups.length }),
    });
    const group = await res.json();
    setGroups([...groups, { ...group, line_items: [] }]);
  };

  const updateGroup = async (id: string, field: string, value: unknown) => {
    setGroups(groups.map((g) => g.id === id ? { ...g, [field]: value } : g));
    await fetch("/api/estimates/groups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
  };

  const deleteGroup = async (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
    await fetch("/api/estimates/groups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  // ---- LINE ITEM ACTIONS ----
  const addLineItem = async (groupId: string) => {
    const items = groups.find((g) => g.id === groupId)?.line_items || [];
    const res = await fetch("/api/estimates/line-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: groupId, name: "New Item", material_cost: 0, labor_cost: 0,
        profit_margin: 20, quantity: 1, unit: "each", sort_order: items.length,
      }),
    });
    const item = await res.json();
    setGroups(groups.map((g) => g.id === groupId ? { ...g, line_items: [...(g.line_items || []), { ...item, variations: [] }] } : g));
  };

  const updateLineItem = async (id: string, field: string, value: unknown) => {
    setGroups(groups.map((g) => ({
      ...g,
      line_items: (g.line_items || []).map((li) => li.id === id ? { ...li, [field]: value } : li),
    })));
    // Debounce save
    await fetch("/api/estimates/line-items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
  };

  const deleteLineItem = async (id: string) => {
    setGroups(groups.map((g) => ({
      ...g,
      line_items: (g.line_items || []).filter((li) => li.id !== id),
    })));
    await fetch("/api/estimates/line-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  // ---- VARIATION ACTIONS ----
  const addVariation = async (lineItemId: string) => {
    const res = await fetch("/api/estimates/variations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line_item_id: lineItemId, name: "Option", material_cost: 0, labor_cost: 0, profit_margin: 20, is_selected: false }),
    });
    const variation = await res.json();
    setGroups(groups.map((g) => ({
      ...g,
      line_items: (g.line_items || []).map((li) =>
        li.id === lineItemId ? { ...li, variations: [...(li.variations || []), variation] } : li
      ),
    })));
  };

  const updateVariation = async (id: string, field: string, value: unknown) => {
    setGroups(groups.map((g) => ({
      ...g,
      line_items: (g.line_items || []).map((li) => ({
        ...li,
        variations: (li.variations || []).map((v) => v.id === id ? { ...v, [field]: value } : v),
      })),
    })));
    await fetch("/api/estimates/variations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    });
  };

  const deleteVariation = async (id: string) => {
    setGroups(groups.map((g) => ({
      ...g,
      line_items: (g.line_items || []).map((li) => ({
        ...li,
        variations: (li.variations || []).filter((v) => v.id !== id),
      })),
    })));
    await fetch("/api/estimates/variations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const selectVariation = async (variationId: string, lineItemId: string) => {
    // Deselect all, select this one
    setGroups(groups.map((g) => ({
      ...g,
      line_items: (g.line_items || []).map((li) =>
        li.id === lineItemId
          ? { ...li, variations: (li.variations || []).map((v) => ({ ...v, is_selected: v.id === variationId })) }
          : li
      ),
    })));
    await fetch("/api/estimates/variations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variationId, line_item_id: lineItemId, is_selected: true }),
    });
  };

  // ---- PAGE TOGGLES ----
  const togglePage = async (field: string, value: boolean) => {
    if (!estimate) return;
    setEstimate({ ...estimate, [field]: value });
    await fetch("/api/estimates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: estimate.id, [field]: value }),
    });
  };

  // ---- GLOBAL MARGIN ----
  const applyGlobalMargin = async () => {
    const updatedGroups = groups.map((g) => ({
      ...g,
      line_items: (g.line_items || []).map((li) => ({ ...li, profit_margin: globalMargin })),
    }));
    setGroups(updatedGroups);
    // Update all line items in DB
    for (const g of updatedGroups) {
      for (const li of g.line_items || []) {
        await fetch("/api/estimates/line-items", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: li.id, profit_margin: globalMargin }),
        });
      }
    }
  };

  // ---- LIBRARY BROWSER ----
  const fetchLibrary = useCallback(async () => {
    let url = "/api/library?";
    if (libraryCategory) url += `category=${libraryCategory}&`;
    if (librarySearch) url += `search=${encodeURIComponent(librarySearch)}&`;
    const res = await fetch(url);
    const data = await res.json();
    setLibraryItems(data);
  }, [libraryCategory, librarySearch]);

  useEffect(() => { if (showLibrary) fetchLibrary(); }, [showLibrary, fetchLibrary]);

  const addLibraryItemToGroup = async (libItem: typeof libraryItems[0], groupId: string) => {
    const items = groups.find((g) => g.id === groupId)?.line_items || [];
    const res = await fetch("/api/estimates/line-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: groupId,
        name: libItem.name,
        description: libItem.description,
        material_cost: libItem.material_cost,
        labor_cost: libItem.labor_cost,
        profit_margin: libItem.profit_margin,
        quantity: 1,
        unit: libItem.unit,
        sort_order: items.length,
      }),
    });
    const item = await res.json();
    setGroups(groups.map((g) => g.id === groupId ? { ...g, line_items: [...(g.line_items || []), { ...item, variations: [] }] } : g));
  };

  // ---- CALCULATE TOTALS ----
  const subtotal = groups.reduce((sum, g) =>
    sum + (g.line_items || []).reduce((s, li) => s + calcLineItemTotal(li), 0), 0
  );
  const taxAmount = subtotal * ((estimate?.tax_rate || 0) / 100);
  const total = subtotal + taxAmount;

  // Save totals
  const saveTotals = async () => {
    if (!estimate) return;
    setSaving(true);
    await fetch("/api/estimates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: estimate.id, subtotal, tax_amount: taxAmount, total }),
    });
    setSaving(false);
  };

  useEffect(() => {
    if (estimate) saveTotals();
  }, [subtotal]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading estimate...</div>;
  }

  if (!estimate) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Estimate {estimate.estimate_number}</h2>
          <p className="text-sm text-slate-500">{estimate.customer_name} &middot; {estimate.address}, {estimate.city}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/estimate/${estimate.signature_token}`}
            target="_blank"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Preview
          </a>
          <button
            onClick={() => {
              const url = `${window.location.origin}/estimate/${estimate.signature_token}`;
              navigator.clipboard.writeText(url);
              alert("Link copied! Send this to the customer:\n\n" + url);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Copy eSign Link
          </button>
        </div>
      </div>

      {/* Page Toggles */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Pages to Include</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { field: "show_cover", label: "Cover Page" },
            { field: "show_photos", label: "Inspection Photos" },
            { field: "show_scope", label: "Scope / Line Items" },
            { field: "show_products", label: "Product Pages" },
            { field: "show_terms", label: "Terms & Conditions" },
            { field: "show_signature", label: "Signature / eSign" },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={(estimate as unknown as Record<string, unknown>)[field] as boolean}
                onChange={(e) => togglePage(field, e.target.checked)}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Tax rate */}
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <label className="text-sm font-medium text-slate-700">Tax Rate (%)</label>
        <input
          type="number" step="0.001" min="0"
          value={estimate.tax_rate}
          onChange={async (e) => {
            const rate = parseFloat(e.target.value) || 0;
            setEstimate({ ...estimate, tax_rate: rate });
            await fetch("/api/estimates", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: estimate.id, tax_rate: rate }),
            });
          }}
          className="w-24 rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Terms & Conditions */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Terms & Conditions</h3>
        <textarea
          value={estimate.terms_content || ""}
          onChange={async (e) => {
            setEstimate({ ...estimate, terms_content: e.target.value });
          }}
          onBlur={async () => {
            await fetch("/api/estimates", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: estimate.id, terms_content: estimate.terms_content }),
            });
          }}
          rows={6}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Enter your terms and conditions here. This will appear on the estimate..."
        />
      </div>

      {/* Global Margin Slider */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900">Global Profit Margin</h3>
          <span className="text-sm font-bold text-blue-600">{globalMargin}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={globalMargin}
          onChange={(e) => setGlobalMargin(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
        <button
          onClick={applyGlobalMargin}
          className="mt-3 rounded-lg bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
        >
          Apply {globalMargin}% to All Line Items
        </button>
      </div>

      {/* Groups and Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Scope of Work</h3>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowLibrary(!showLibrary); if (!showLibrary) fetchLibrary(); }}
              className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              {showLibrary ? "Close Library" : "Browse Library"}
            </button>
            <button onClick={addGroup} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">
              + Add Group
            </button>
          </div>
        </div>

        {/* Library Browser Panel */}
        {showLibrary && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex gap-2">
              <input
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="Search library items..."
              />
              <select
                value={libraryCategory || ""}
                onChange={(e) => setLibraryCategory(e.target.value || null)}
                className="rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {["Roofing","Gutters","Siding","Windows","Chimney","Flashing","Ventilation","Misc"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {groups.length > 0 && (
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-600">Add to group:</label>
                <select
                  value={addToGroupId || groups[0]?.id || ""}
                  onChange={(e) => setAddToGroupId(e.target.value)}
                  className="ml-2 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {libraryItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                    <p className="text-xs text-slate-400">{item.category} &middot; ${((item.material_cost + item.labor_cost) / (1 - Math.min(item.profit_margin, 99.99) / 100)).toFixed(2)}/{item.unit}</p>
                  </div>
                  <button
                    onClick={() => {
                      const targetGroup = addToGroupId || groups[0]?.id;
                      if (targetGroup) addLibraryItemToGroup(item, targetGroup);
                    }}
                    disabled={groups.length === 0}
                    className="shrink-0 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    + Add
                  </button>
                </div>
              ))}
              {libraryItems.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-4">
                  No items found. <a href="/dashboard/sales/library" className="text-blue-600 hover:underline">Manage Library</a>
                </p>
              )}
            </div>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2.5">
              <button
                onClick={() => setGroups(groups.map((g) => g.id === group.id ? { ...g, is_collapsed: !g.is_collapsed } : g))}
                className="text-slate-400"
              >
                <svg className={`h-4 w-4 transition-transform ${group.is_collapsed ? "" : "rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <input
                value={group.name}
                onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:outline-none"
              />
              <span className="text-xs text-slate-500">
                {(group.line_items || []).length} items &middot; $
                {(group.line_items || []).reduce((s, li) => s + calcLineItemTotal(li), 0).toFixed(2)}
              </span>
              <button onClick={() => deleteGroup(group.id)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            {/* Line items */}
            {!group.is_collapsed && (
              <div className="space-y-2 p-3">
                {(group.line_items || []).map((item) => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={updateLineItem}
                    onDelete={deleteLineItem}
                    onAddVariation={addVariation}
                    onUpdateVariation={updateVariation}
                    onDeleteVariation={deleteVariation}
                    onSelectVariation={selectVariation}
                  />
                ))}
                <button
                  onClick={() => addLineItem(group.id)}
                  className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700"
                >
                  + Add Line Item
                </button>
              </div>
            )}
          </div>
        ))}

        {groups.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm text-slate-500">No groups yet. Click &quot;+ Add Group&quot; to start building your estimate.</p>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex justify-end space-y-1">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            {estimate.tax_rate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax ({estimate.tax_rate}%)</span>
                <span className="text-slate-900">${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-lg">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-green-700">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
