import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock, Pause, RotateCcw } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Time Tracking" };

export default async function TimeTrackingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const logs = [
    { project: "Website Redesign", task: "Homepage UI Design", duration: "03:45:12", date: "Today" },
    { project: "Mobile App", task: "Push Notification Setup", duration: "02:15:00", date: "Today" },
    { project: "Internal Tool", task: "API Integration & Testing", duration: "04:30:22", date: "Yesterday" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111827]">
          Time Tracking
        </h1>
        <p className="text-xs sm:text-[13px] font-medium text-[#6B7280] mt-0.5">
          Record billable hours, monitor task time, and boost productivity.
        </p>
      </div>

      {/* Active Timer Box */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#F3F9DE] text-[#88C315] flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-[#111827]">Current Active Timer</h3>
            <p className="text-[11px] sm:text-xs text-[#6B7280] truncate">Project: Website Redesign (TRAW-4)</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAEDF2]">
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#111827]">01:24:45</span>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#88C315] hover:bg-[#77AB12] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer">
              <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition-colors cursor-pointer">
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-6 shadow-2xs">
        <h3 className="text-sm sm:text-[15px] font-bold text-[#111827] mb-3 sm:mb-4">Recent Time Logs</h3>
        <div className="divide-y divide-[#EAEDF2]">
          {logs.map((log, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#111827] truncate">{log.task}</p>
                <p className="text-[#6B7280] text-[11px] truncate">{log.project}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-bold text-[#111827]">{log.duration}</p>
                <p className="text-[#9CA3AF] text-[10px] sm:text-[11px]">{log.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
