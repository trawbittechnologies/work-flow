import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        <p className="text-sm font-medium animate-pulse">Loading workspace...</p>
      </div>
    </div>
  );
}
