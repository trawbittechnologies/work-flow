import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TrendingUp, Award, Download } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
            Analytics & Reports
          </h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#6B7280] mt-0.5">
            Measure project velocity, team output, and resource allocation.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-bold rounded-xl bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer">
          <Download className="h-4 w-4 text-[#6B7280]" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-semibold text-[#6B7280]">Velocity Rate</p>
          <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">94.2%</h3>
          <p className="text-xs font-semibold text-[#16A34A] mt-1 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> +8.4% this sprint
          </p>
        </div>
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-semibold text-[#6B7280]">Avg Completion Time</p>
          <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">2.4 days</h3>
          <p className="text-xs font-semibold text-[#16A34A] mt-1 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> 18% faster
          </p>
        </div>
        <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <p className="text-xs font-semibold text-[#6B7280]">Top Performer</p>
          <h3 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">Jishnu TV</h3>
          <p className="text-xs font-semibold text-[#7C3AED] mt-1 flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> 14 tasks closed
          </p>
        </div>
      </div>
    </div>
  );
}
