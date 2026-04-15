import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact_id");
  const jobId = searchParams.get("job_id");

  let query = supabase.from("activity_log").select("*").order("created_at", { ascending: false });
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
  const { data, error } = await supabase.from("activity_log").insert({ ...body, created_by: user.id }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
