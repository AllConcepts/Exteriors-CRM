"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Create a new deal manually
export async function createDeal(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("deals").insert({
    created_by: user.id,
    contact_name: formData.get("contact_name") as string,
    contact_phone: (formData.get("contact_phone") as string) || null,
    contact_email: (formData.get("contact_email") as string) || null,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: (formData.get("state") as string) || "TX",
    zip: (formData.get("zip") as string) || null,
    stage: "new_lead",
    deal_value: formData.get("deal_value") ? parseFloat(formData.get("deal_value") as string) : null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) {
    redirect("/dashboard/sales/new?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard/sales");
}

// Move a deal to a new stage
export async function updateDealStage(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const stage = formData.get("stage") as string;
  const lost_reason = (formData.get("lost_reason") as string) || null;

  const { error } = await supabase
    .from("deals")
    .update({ stage, lost_reason })
    .eq("id", id);

  if (error) {
    redirect(`/dashboard/sales/${id}?error=` + encodeURIComponent(error.message));
  }

  redirect(`/dashboard/sales/${id}`);
}

// Update deal details
export async function updateDeal(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("deals")
    .update({
      contact_name: formData.get("contact_name") as string,
      contact_phone: (formData.get("contact_phone") as string) || null,
      contact_email: (formData.get("contact_email") as string) || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: (formData.get("state") as string) || "TX",
      zip: (formData.get("zip") as string) || null,
      deal_value: formData.get("deal_value") ? parseFloat(formData.get("deal_value") as string) : null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/dashboard/sales/${id}?error=` + encodeURIComponent(error.message));
  }

  redirect(`/dashboard/sales/${id}`);
}
