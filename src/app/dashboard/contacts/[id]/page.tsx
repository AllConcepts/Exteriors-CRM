import Link from "next/link";
import CustomerProfile from "@/components/customer-profile";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <div className="mb-4">
        <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Back to Pipeline
        </Link>
      </div>
      <CustomerProfile contactId={id} />
    </div>
  );
}
