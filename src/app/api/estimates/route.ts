import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST — create a new estimate for a job
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Generate estimate number: EST-YYYYMMDD-XXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  const estimateNumber = `EST-${dateStr}-${rand}`;

  const { data, error } = await supabase.from("estimates").insert({
    created_by: user.id,
    job_id: body.job_id,
    estimate_number: estimateNumber,
    customer_name: body.customer_name,
    address: body.address,
    city: body.city,
    state: body.state || "TX",
    zip: body.zip || null,
    terms_content: body.terms_content || null,
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// GET — load an estimate with all related data
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const jobId = searchParams.get("job_id");

  if (id) {
    // Load single estimate with all nested data
    const { data: estimate } = await supabase.from("estimates").select("*").eq("id", id).single();
    if (!estimate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [groups, photos, products, customPages] = await Promise.all([
      supabase.from("estimate_groups").select("*").eq("estimate_id", id).order("sort_order"),
      supabase.from("estimate_photos").select("*").eq("estimate_id", id).order("sort_order"),
      supabase.from("estimate_products").select("*").eq("estimate_id", id).order("sort_order"),
      supabase.from("estimate_custom_pages").select("*").eq("estimate_id", id).order("sort_order"),
    ]);

    // Load line items and variations for each group
    const groupIds = (groups.data || []).map((g) => g.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lineItemsData: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let variationsData: any[] = [];

    if (groupIds.length > 0) {
      const liRes = await supabase.from("estimate_line_items").select("*").in("group_id", groupIds).order("sort_order");
      lineItemsData = liRes.data || [];
      const lineItemIds = lineItemsData.map((li) => li.id as string);
      if (lineItemIds.length > 0) {
        const vRes = await supabase.from("estimate_variations").select("*").in("line_item_id", lineItemIds);
        variationsData = vRes.data || [];
      }
    }

    // Nest variations into line items, line items into groups
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variationsByItem: Record<string, any[]> = {};
    for (const v of variationsData) {
      const liId = v.line_item_id as string;
      if (!variationsByItem[liId]) variationsByItem[liId] = [];
      variationsByItem[liId].push(v);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemsByGroup: Record<string, any[]> = {};
    for (const li of lineItemsData) {
      const gId = li.group_id as string;
      if (!itemsByGroup[gId]) itemsByGroup[gId] = [];
      itemsByGroup[gId].push({ ...li, variations: variationsByItem[li.id as string] || [] });
    }

    const fullGroups = (groups.data || []).map((g) => ({
      ...g,
      line_items: itemsByGroup[g.id] || [],
    }));

    return NextResponse.json({
      ...estimate,
      groups: fullGroups,
      photos: photos.data || [],
      products: products.data || [],
      custom_pages: customPages.data || [],
    });
  }

  if (jobId) {
    // List estimates for a job
    const { data } = await supabase.from("estimates").select("*").eq("job_id", jobId).order("created_at", { ascending: false });
    return NextResponse.json(data || []);
  }

  return NextResponse.json({ error: "Provide id or job_id" }, { status: 400 });
}

// PATCH — update estimate fields
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { id, ...updates } = body;

  const { error } = await supabase.from("estimates").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
