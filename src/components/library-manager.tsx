"use client";

import { useState, useEffect, useCallback } from "react";
import { UNITS } from "@/lib/estimate-types";

const CATEGORIES = ["Roofing", "Gutters", "Siding", "Windows", "Chimney", "Flashing", "Ventilation", "Misc"];

const CATEGORY_COLORS: Record<string, string> = {
  Roofing: "bg-blue-100 text-blue-700",
  Gutters: "bg-green-100 text-green-700",
  Siding: "bg-purple-100 text-purple-700",
  Windows: "bg-amber-100 text-amber-700",
  Chimney: "bg-red-100 text-red-700",
  Flashing: "bg-orange-100 text-orange-700",
  Ventilation: "bg-cyan-100 text-cyan-700",
  Misc: "bg-slate-100 text-slate-700",
};

interface LibraryItem {
  id: string;
  name: string;
  description: string | null;
  material_cost: number;
  labor_cost: number;
  profit_margin: number;
  unit: string;
  category: string;
}

export default function LibraryManager() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

  const fetchItems = useCallback(async () => {
    let url = "/api/library?";
    if (filterCategory) url += `category=${filterCategory}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    const res = await fetch(url);
    const data = await res.json();
    setItems(data);
  }, [filterCategory, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      material_cost: parseFloat(formData.get("material_cost") as string) || 0,
      labor_cost: parseFloat(formData.get("labor_cost") as string) || 0,
      profit_margin: parseFloat(formData.get("profit_margin") as string) || 20,
      unit: formData.get("unit") as string,
      category: formData.get("category") as string,
    };

    if (editingItem) {
      await fetch("/api/library", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingItem.id, ...body }),
      });
    } else {
      await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setShowForm(false);
    setEditingItem(null);
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this library item?")) return;
    await fetch("/api/library", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchItems();
  };

  const sellingPrice = (item: LibraryItem) =>
    (item.material_cost + item.labor_cost) / (1 - Math.min(item.profit_margin, 99.99) / 100);

  // Group items by category for display
  const grouped: Record<string, LibraryItem[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Line Item Library</h1>
          <p className="text-sm text-slate-600">
            {items.length} items — your standard pricing for estimates
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); }}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Add Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          placeholder="Search items..."
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${!filterCategory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${filterCategory === cat ? "bg-slate-900 text-white" : CATEGORY_COLORS[cat] + " hover:opacity-80"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            {editingItem ? "Edit Item" : "Add New Library Item"}
          </h3>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">Name *</label>
                <input name="name" required defaultValue={editingItem?.name || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Architectural Shingles" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600">Description</label>
                <input name="description" defaultValue={editingItem?.description || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="GAF Timberline HDZ lifetime shingles" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Material Cost ($)</label>
                <input name="material_cost" type="number" step="0.01" defaultValue={editingItem?.material_cost || 0} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Labor Cost ($)</label>
                <input name="labor_cost" type="number" step="0.01" defaultValue={editingItem?.labor_cost || 0} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Profit Margin (%)</label>
                <input name="profit_margin" type="number" step="1" defaultValue={editingItem?.profit_margin || 20} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Unit</label>
                <select name="unit" defaultValue={editingItem?.unit || "each"} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Category</label>
                <select name="category" defaultValue={editingItem?.category || "Roofing"} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {editingItem ? "Save Changes" : "Add to Library"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items grouped by category */}
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category} className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[category]}`}>{category}</span>
            <span className="text-slate-400">{catItems.length} items</span>
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-slate-600">Item</th>
                  <th className="px-4 py-2.5 font-medium text-slate-600 text-right">Material</th>
                  <th className="px-4 py-2.5 font-medium text-slate-600 text-right">Labor</th>
                  <th className="px-4 py-2.5 font-medium text-slate-600 text-right">Margin</th>
                  <th className="px-4 py-2.5 font-medium text-slate-600 text-right">Sell Price</th>
                  <th className="px-4 py-2.5 font-medium text-slate-600">Unit</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">${item.material_cost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">${item.labor_cost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{item.profit_margin}%</td>
                    <td className="px-4 py-2.5 text-right font-medium text-green-700">${sellingPrice(item).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-slate-500">{item.unit}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingItem(item); setShowForm(true); }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h3 className="text-lg font-medium text-slate-900">No items in your library</h3>
          <p className="mt-1 text-sm text-slate-500">Add your standard line items so you can quickly build estimates.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Your First Item
          </button>
        </div>
      )}
    </div>
  );
}
