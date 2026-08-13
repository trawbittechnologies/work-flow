import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111827]">
            Calendar & Schedule
          </h1>
          <p className="text-[13px] font-medium text-[#6B7280] mt-0.5">
            Keep track of project milestones, sprint deadlines, and team meetings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-1 shadow-2xs">
            <button className="p-1 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#111827]">May 2025</span>
            <button className="p-1 hover:bg-[#F3F4F6] rounded-lg text-[#6B7280]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex items-center gap-2 h-9 px-4 text-xs font-bold rounded-xl bg-[#88C315] hover:bg-[#77AB12] text-white transition-colors shadow-2xs">
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-6 shadow-2xs">
        <div className="grid grid-cols-7 gap-px border-b border-[#EAEDF2] pb-3 mb-3 text-center">
          {days.map((day) => (
            <span key={day} className="text-xs font-bold text-[#6B7280]">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((d) => {
            const isToday = d === 15;
            return (
              <div
                key={d}
                className={`min-h-[90px] p-2.5 rounded-xl border transition-all ${
                  isToday
                    ? "border-[#88C315] bg-[#F3F9DE]/40"
                    : "border-[#EAEDF2] bg-[#FAFAFB] hover:border-[#D1D5DB]"
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    isToday
                      ? "h-6 w-6 rounded-full bg-[#88C315] text-white flex items-center justify-center"
                      : "text-[#4B5563]"
                  }`}
                >
                  {d <= 31 ? d : d - 31}
                </span>
                {d === 14 && (
                  <div className="mt-1.5 p-1 bg-[#F3F9DE] text-[#659A08] text-[10px] font-bold rounded truncate">
                    Sprint Review
                  </div>
                )}
                {d === 16 && (
                  <div className="mt-1.5 p-1 bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-bold rounded truncate">
                    Release v2.4
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
