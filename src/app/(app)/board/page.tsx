import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Board" };

export default async function BoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const columns = [
    { title: "To Do", count: 4, color: "bg-[#9CA3AF]" },
    { title: "In Progress", count: 3, color: "bg-[#F59E0B]" },
    { title: "In Review", count: 2, color: "bg-[#7C3AED]" },
    { title: "Done", count: 8, color: "bg-[#88C315]" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111827]">
            Kanban Board
          </h1>
          <p className="text-[13px] font-medium text-[#6B7280] mt-0.5">
            Visualize workflow, track progress, and move tasks across columns.
          </p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 h-9 px-4 text-xs font-bold rounded-xl bg-[#88C315] hover:bg-[#77AB12] text-white transition-colors shadow-2xs"
        >
          <Plus className="h-4 w-4" /> New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => (
          <div
            key={col.title}
            className="bg-[#F8F9FA] border border-[#EAEDF2] rounded-2xl p-4 min-h-[450px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <h3 className="text-xs font-bold text-[#111827]">{col.title}</h3>
              </div>
              <span className="text-xs font-bold text-[#6B7280] bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                {col.count}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#D1D5DB] rounded-xl bg-white/50">
              <LayoutGrid className="h-8 w-8 text-[#9CA3AF] mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-[#6B7280]">
                Interactive tasks synced with project backlog
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
