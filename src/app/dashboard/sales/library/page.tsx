import Link from "next/link";
import LibraryManager from "@/components/library-manager";

export default function LibraryPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/dashboard/sales" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Back to Pipeline
        </Link>
      </div>
      <LibraryManager />
    </div>
  );
}
