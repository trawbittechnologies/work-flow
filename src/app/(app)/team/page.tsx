import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Mail, CheckSquare } from "lucide-react";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Team" };

interface MemberProjectMembership {
  project: {
    id: string;
    name: string;
    icon: string;
  };
}

interface MemberTask {
  id: string;
  status: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  projectMembships: MemberProjectMembership[];
  assignedTasks: MemberTask[];
}

import { AddMemberButton } from "./AddMemberButton";

export default async function GlobalTeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUserId = session.user.id;

  // Find all projects current user belongs to
  const myProjects = await prisma.project.findMany({
    where: { members: { some: { userId: currentUserId } } },
    select: { id: true, name: true, icon: true },
  });

  const projectIds = myProjects.map((p: { id: string }) => p.id);

  // Find all members in the workspace
  const teamMembers = await prisma.user.findMany({
    include: {
      projectMembships: {
        where: { projectId: { in: projectIds } },
        include: {
          project: { select: { id: true, name: true, icon: true } },
        },
      },
      assignedTasks: {
        where: { projectId: { in: projectIds } },
        select: { id: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Workspace Team</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            All members in your workspace ({teamMembers.length})
          </p>
        </div>
        <AddMemberButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member: TeamMember) => {
          const assignedCount = member.assignedTasks.length;
          const completedCount = member.assignedTasks.filter((t: MemberTask) => t.status === "DONE").length;
          const isCurrentUser = member.id === currentUserId;

          return (
            <div
              key={member.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <Avatar name={member.name} src={member.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {member.name}
                    </h3>
                    {isCurrentUser && (
                      <span className="text-[9px] font-bold bg-[var(--primary-subtle)] text-[var(--primary)] px-1.5 py-0.2 rounded uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Shared Projects Chips */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1.5">
                  Projects ({member.projectMembships.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.projectMembships.map((pm: MemberProjectMembership) => (
                    <span
                      key={pm.project.id}
                      className="inline-flex items-center gap-1 text-[11px] bg-[var(--background)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-[6px] text-[var(--text-secondary)] font-medium"
                    >
                      <span className="text-text-secondary"><ProjectIcon name={pm.project.icon} className="h-3 w-3" /></span>
                      <span className="truncate max-w-[120px]">{pm.project.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Task Workload Summary */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>
                    <strong className="text-[var(--text-primary)]">{assignedCount}</strong> tasks
                  </span>
                </div>
                <div>
                  <strong className="text-emerald-600 dark:text-emerald-400">{completedCount}</strong> completed
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
