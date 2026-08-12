import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Account Settings</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage your preferences and workspace settings</p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 space-y-6 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1">Appearance & Preferences</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Flowdesk automatically respects your system&apos;s light/dark mode preference and standard accessibility standards.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Account Information</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block">Name</span>
              <span className="font-semibold text-[var(--text-primary)]">{user?.name}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block">Email</span>
              <span className="font-semibold text-[var(--text-primary)]">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
