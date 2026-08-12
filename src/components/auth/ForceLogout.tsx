"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export function ForceLogout() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" });
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-sm text-[var(--text-muted)] animate-pulse">
        Refreshing session...
      </div>
    </div>
  );
}
