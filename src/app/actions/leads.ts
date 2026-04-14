"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Create a new lead from the canvassing form
export async function createLead(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("leads").insert({
    created_by: user.id,
    homeowner_name: formData.get("homeowner_name") as string,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: (formData.get("state") as string) || "TX",
    zip: (formData.get("zip") as string) || null,
    notes: (formData.get("notes") as string) || null,
    status: "new",
    source: "canvassing",
  });

  if (error) {
    redirect(
      "/dashboard/canvassing/new?error=" + encodeURIComponent(error.message)
    );
  }

  redirect("/dashboard/canvassing");
}

// Update lead status (e.g., mark as contacted, appointment set, etc.)
export async function updateLeadStatus(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);

  if (error) {
    redirect(
      `/dashboard/canvassing/${id}?error=` + encodeURIComponent(error.message)
    );
  }

  redirect(`/dashboard/canvassing/${id}`);
}

// Update lead details
export async function updateLead(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("leads")
    .update({
      homeowner_name: formData.get("homeowner_name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: (formData.get("state") as string) || "TX",
      zip: (formData.get("zip") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/dashboard/canvassing/${id}?error=` + encodeURIComponent(error.message)
    );
  }

  redirect(`/dashboard/canvassing/${id}`);
}
