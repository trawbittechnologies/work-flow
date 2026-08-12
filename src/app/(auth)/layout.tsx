import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 bg-[var(--primary)] rounded-[12px] flex items-center justify-center mb-3 shadow-lg">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Flowdesk</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Plan. Assign. Finish.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
