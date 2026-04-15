import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EstimateBuilder from "@/components/estimate-builder";

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (!job) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Back to Pipeline
        </Link>
      </div>
      <EstimateBuilder
        jobId={id}
        job={{
          customer_name: job.customer_name,
          address: job.address,
          city: job.city,
          state: job.state,
          zip: job.zip,
        }}
      />
    </div>
  );
}
