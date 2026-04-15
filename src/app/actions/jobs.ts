"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Create a new job manually
export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("jobs").insert({
    created_by: user.id,
    customer_name: formData.get("customer_name") as string,
    customer_phone: (formData.get("customer_phone") as string) || null,
    customer_email: (formData.get("customer_email") as string) || null,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    state: (formData.get("state") as string) || "TX",
    zip: (formData.get("zip") as string) || null,
    stage: "new_lead",
    job_value: formData.get("job_value") ? parseFloat(formData.get("job_value") as string) : null,
    assigned_rep: (formData.get("assigned_rep") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) {
    redirect("/dashboard/sales?error=" + encodeURIComponent(error.message));
  }
  redirect("/dashboard/sales");
}

// Update job details
export async function updateJob(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("jobs")
    .update({
      customer_name: formData.get("customer_name") as string,
      customer_phone: (formData.get("customer_phone") as string) || null,
      customer_email: (formData.get("customer_email") as string) || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: (formData.get("state") as string) || "TX",
      zip: (formData.get("zip") as string) || null,
      job_value: formData.get("job_value") ? parseFloat(formData.get("job_value") as string) : null,
      assigned_rep: (formData.get("assigned_rep") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) {
    redirect("/dashboard/sales?error=" + encodeURIComponent(error.message));
  }
  redirect("/dashboard/sales");
}
