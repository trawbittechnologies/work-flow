import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign in | Trawbit FlowDesk",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9F6] bg-tech-grid px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-12 w-12 rounded-[2px] overflow-hidden flex items-center justify-center mb-3 shadow-xs border border-[#DDE2D8]">
            <Image
              src="/logo.png"
              alt="Trawbit FlowDesk"
              width={48}
              height={48}
              className="h-12 w-12 object-cover rounded-[2px]"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5 font-display">
            <span className="text-2xl font-black text-[#071A49] tracking-tight">
              Trawbit
            </span>
            <span className="text-2xl font-black text-[#B7D600] tracking-tight">
              FlowDesk
            </span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#586274] mt-1">
            High-Tech Editorial Workspace
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
