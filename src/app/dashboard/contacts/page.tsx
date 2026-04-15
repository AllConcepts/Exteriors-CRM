"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");

  const fetchContacts = useCallback(async () => {
    let url = "/api/contacts?";
    if (search) url += `search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    setContacts(await res.json());
  }, [search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-600">{contacts.length} customers</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          placeholder="Search contacts..."
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600">Phone</th>
              <th className="px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 font-medium text-slate-600">Address</th>
              <th className="px-4 py-3 font-medium text-slate-600">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/contacts/${c.id}`} className="font-medium text-slate-900 hover:text-blue-600">{c.name}</Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.email || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.address ? `${c.address}, ${c.city}` : "—"}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No contacts found. Contacts are auto-created when you create jobs.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
