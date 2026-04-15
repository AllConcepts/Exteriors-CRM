import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact_id");
  const jobId = searchParams.get("job_id");

  let query = supabase.from("invoices").select("*, jobs(customer_name, address)").order("invoice_date", { ascending: false });
  if (contactId) query = query.eq("contact_id", contactId);
  if (jobId) query = query.eq("job_id", jobId);
  const { data } = await query;
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const totalDue = (body.invoice_total || 0) - (body.total_paid || 0);
  const { data, error } = await supabase.from("invoices").insert({ ...body, total_due: totalDue, created_by: user.id }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { id, ...updates } = await request.json();
  if (updates.invoice_total !== undefined || updates.total_paid !== undefined) {
    const { data: current } = await supabase.from("invoices").select("invoice_total, total_paid").eq("id", id).single();
    const total = updates.invoice_total ?? current?.invoice_total ?? 0;
    const paid = updates.total_paid ?? current?.total_paid ?? 0;
    updates.total_due = total - paid;
  }
  const { error } = await supabase.from("invoices").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
