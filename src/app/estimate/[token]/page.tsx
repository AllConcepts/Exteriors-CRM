"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { calcLineItemTotal, type Estimate, type EstimateGroup } from "@/lib/estimate-types";

export default function CustomerEstimatePage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [groups, setGroups] = useState<EstimateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signedName, setSignedName] = useState("");
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const supabase = createClient();

  // Resolve params promise
  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  // Load estimate by token
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const { data } = await supabase.from("estimates").select("*").eq("signature_token", token).single();
      if (!data) { setLoading(false); return; }

      setEstimate(data as Estimate);
      if (data.signed_at) setSigned(true);

      // Load groups with line items
      const { data: grps } = await supabase.from("estimate_groups").select("*").eq("estimate_id", data.id).order("sort_order");
      if (grps && grps.length > 0) {
        const groupIds = grps.map((g) => g.id);
        const { data: items } = await supabase.from("estimate_line_items").select("*").in("group_id", groupIds).order("sort_order");
        const itemIds = (items || []).map((i) => i.id);
        let vars: unknown[] = [];
        if (itemIds.length > 0) {
          const { data: v } = await supabase.from("estimate_variations").select("*").in("line_item_id", itemIds);
          vars = v || [];
        }

        // Nest
        const varsByItem: Record<string, unknown[]> = {};
        for (const v of vars as Record<string, unknown>[]) {
          const liId = v.line_item_id as string;
          if (!varsByItem[liId]) varsByItem[liId] = [];
          varsByItem[liId].push(v);
        }
        const itemsByGroup: Record<string, unknown[]> = {};
        for (const i of (items || []) as Record<string, unknown>[]) {
          const gId = i.group_id as string;
          if (!itemsByGroup[gId]) itemsByGroup[gId] = [];
          itemsByGroup[gId].push({ ...i, variations: varsByItem[i.id as string] || [] });
        }
        setGroups(grps.map((g) => ({ ...g, line_items: itemsByGroup[g.id] || [] })) as EstimateGroup[]);
      }
      setLoading(false);
    };
    load();
  }, [token, supabase]);

  // Signature canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const start = (e: MouseEvent | TouchEvent) => { isDrawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const draw = (e: MouseEvent | TouchEvent) => { if (!isDrawing.current) return; e.preventDefault(); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const stop = () => { isDrawing.current = false; };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("mouseleave", stop);
    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("mouseleave", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stop);
    };
  }, [loading]);

  const handleSign = async () => {
    if (!estimate || !signedName.trim() || !canvasRef.current) return;
    setSigning(true);
    const signatureData = canvasRef.current.toDataURL("image/png");

    // Update estimate as signed
    await supabase.from("estimates").update({
      status: "signed",
      signed_at: new Date().toISOString(),
      signed_by_name: signedName,
      signature_data: signatureData,
    }).eq("id", estimate.id);

    // Move the job to "signed_contract" stage
    if (estimate.job_id) {
      await supabase.from("jobs").update({ stage: "signed_contract" }).eq("id", estimate.job_id);
    }

    setSigned(true);
    setSigning(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Loading estimate...</div>;
  if (!estimate) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-red-500">Estimate not found</div>;

  const subtotal = groups.reduce((sum, g) =>
    sum + (g.line_items || []).reduce((s, li) => s + calcLineItemTotal(li), 0), 0
  );
  const taxAmount = subtotal * ((estimate.tax_rate || 0) / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-3xl space-y-1">

        {/* PAGE 1: Cover */}
        {estimate.show_cover && (
          <div className="rounded-t-xl bg-white p-12 shadow-sm text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">All Concepts Exteriors</h1>
            <p className="mt-1 text-sm text-slate-500">Professional Roofing Estimate</p>
            <div className="mt-8 space-y-1">
              <p className="text-lg font-medium text-slate-800">Prepared for: {estimate.customer_name}</p>
              <p className="text-slate-600">{estimate.address}, {estimate.city}, {estimate.state} {estimate.zip}</p>
              <p className="text-sm text-slate-500">Estimate #{estimate.estimate_number}</p>
              <p className="text-sm text-slate-500">{new Date(estimate.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* PAGE 3: Scope of Work */}
        {estimate.show_scope && groups.length > 0 && (
          <div className="bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">Scope of Work</h2>
            {groups.map((group) => (
              <div key={group.id} className="mb-6">
                <h3 className="mb-3 text-base font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded">{group.name}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                      <th className="pb-2 font-medium">Item</th>
                      <th className="pb-2 font-medium text-right">Qty</th>
                      <th className="pb-2 font-medium text-right">Unit</th>
                      <th className="pb-2 font-medium text-right">Price</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(group.line_items || []).map((item) => {
                      const itemTotal = calcLineItemTotal(item);
                      const unitPrice = item.quantity > 0 ? itemTotal / item.quantity : 0;
                      return (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-2">
                            <p className="font-medium text-slate-800">{item.name}</p>
                            {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                          </td>
                          <td className="py-2 text-right text-slate-700">{item.quantity}</td>
                          <td className="py-2 text-right text-slate-700">{item.unit}</td>
                          <td className="py-2 text-right text-slate-700">${unitPrice.toFixed(2)}</td>
                          <td className="py-2 text-right font-medium text-slate-900">${itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2 border-t border-slate-300 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {estimate.tax_rate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax ({estimate.tax_rate}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-lg">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-green-700">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 5: Terms and Conditions */}
        {estimate.show_terms && estimate.terms_content && (
          <div className="bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">Terms and Conditions</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {estimate.terms_content}
            </div>
          </div>
        )}

        {/* LAST PAGE: Signature / eSign */}
        {estimate.show_signature && (
          <div className="rounded-b-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">Authorization & Signature</h2>

            {signed || estimate.signed_at ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-3 text-lg font-semibold text-green-800">Estimate Signed</h3>
                <p className="mt-1 text-sm text-green-700">
                  Signed by {estimate.signed_by_name || signedName} on{" "}
                  {estimate.signed_at ? new Date(estimate.signed_at).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
                {(estimate.signature_data) && (
                  <img src={estimate.signature_data} alt="Signature" className="mx-auto mt-4 h-20" />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  By signing below, you authorize All Concepts Exteriors to perform the work described in this estimate for a total of{" "}
                  <span className="font-bold text-slate-900">${total.toFixed(2)}</span>.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    value={signedName}
                    onChange={(e) => setSignedName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Signature (draw below)</label>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={150}
                    className="w-full cursor-crosshair rounded-lg border-2 border-slate-300 bg-white"
                    style={{ touchAction: "none" }}
                  />
                  <button
                    onClick={() => {
                      const ctx = canvasRef.current?.getContext("2d");
                      if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }}
                    className="mt-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear signature
                  </button>
                </div>
                <button
                  onClick={handleSign}
                  disabled={signing || !signedName.trim()}
                  className="w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {signing ? "Signing..." : "Sign Estimate"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
