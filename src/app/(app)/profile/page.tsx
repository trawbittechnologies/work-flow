import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";
import { Mail, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          ownedProjects: true,
          assignedTasks: true,
          createdTasks: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  const completedTasksCount = await prisma.task.count({
    where: { assigneeId: user.id, status: "DONE" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">User Profile</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Your personal workspace information</p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-6 space-y-6 shadow-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <Avatar name={user.name} src={user.avatar} size="xl" />
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{user.name}</h2>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-[var(--background)] p-3.5 rounded-[10px] border border-[var(--border-subtle)]">
            <span className="text-xl font-bold text-[var(--primary)] block">{user._count.ownedProjects}</span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Projects Owned</span>
          </div>

          <div className="bg-[var(--background)] p-3.5 rounded-[10px] border border-[var(--border-subtle)]">
            <span className="text-xl font-bold text-amber-500 block">{user._count.assignedTasks}</span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Tasks Assigned</span>
          </div>

          <div className="bg-[var(--background)] p-3.5 rounded-[10px] border border-[var(--border-subtle)]">
            <span className="text-xl font-bold text-emerald-500 block">{completedTasksCount}</span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Tasks Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
