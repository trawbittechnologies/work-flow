import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Time Tracking" };

export default async function TimeTrackingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

      {/* Coming soon / empty state */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-10 shadow-2xs flex flex-col items-center justify-center text-center min-h-[360px]">
        <div className="h-16 w-16 rounded-2xl bg-[#F3F9DE] flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-[#88C315]" />
        </div>
        <h2 className="text-base font-bold text-[#111827]">Time tracking coming soon</h2>
        <p className="text-sm text-[#9CA3AF] mt-2 max-w-xs">
          Log time against tasks and projects to measure productivity. This feature is under development.
        </p>
      </div>
    </div>
  );
}
