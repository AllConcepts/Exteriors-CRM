import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact_id");
  const jobId = searchParams.get("job_id");
  const invoiceId = searchParams.get("invoice_id");

  let query = supabase.from("payments").select("*, invoices(invoice_number), jobs(customer_name)").order("payment_date", { ascending: false });
  if (contactId) query = query.eq("contact_id", contactId);
  if (jobId) query = query.eq("job_id", jobId);
  if (invoiceId) query = query.eq("invoice_id", invoiceId);
  const { data } = await query;
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.from("payments").insert({ ...body, created_by: user.id }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Update invoice total_paid if linked to an invoice
  if (body.invoice_id && body.payment_amount) {
    const { data: invoice } = await supabase.from("invoices").select("total_paid, invoice_total").eq("id", body.invoice_id).single();
    if (invoice) {
      const newPaid = (invoice.total_paid || 0) + body.payment_amount;
      await supabase.from("invoices").update({ total_paid: newPaid, total_due: invoice.invoice_total - newPaid }).eq("id", body.invoice_id);
    }
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { id, ...updates } = await request.json();
  const { error } = await supabase.from("payments").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
