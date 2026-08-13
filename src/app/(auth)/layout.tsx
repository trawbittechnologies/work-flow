import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign in | Trawbit FlowDesk",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-12 w-12 rounded-full overflow-hidden flex items-center justify-center mb-3 shadow-md">
            <Image
              src="/logo-icon.png"
              alt="Trawbit FlowDesk"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-[#111827] tracking-tight">
              Trawbit
            </span>
            <span className="text-xl font-black text-[#94CB1E] tracking-tight">
              FlowDesk
            </span>
          </div>
          <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">
            Modern Project & Task Workspace
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
