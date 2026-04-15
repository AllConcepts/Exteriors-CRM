import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact_id");
  const jobId = searchParams.get("job_id");

  let query = supabase.from("material_orders").select("*, jobs(customer_name, address)").order("order_date", { ascending: false });
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
  const { data, error } = await supabase.from("material_orders").insert({ ...body, created_by: user.id }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { id, ...updates } = await request.json();
  const { error } = await supabase.from("material_orders").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
