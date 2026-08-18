import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Mail, CheckSquare } from "lucide-react";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import { isAdmin } from "@/lib/role";
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
import { DeleteMemberButton } from "./DeleteMemberButton";

export default async function GlobalTeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUserId = session.user.id;
  const admin = await isAdmin(currentUserId);

  // Find all projects current user belongs to
  const myProjects = await prisma.project.findMany({
    where: admin ? undefined : { members: { some: { userId: currentUserId } } },
    select: { id: true, name: true, icon: true },
  });

  const projectIds = myProjects.map((p: { id: string }) => p.id);

  // Find all members in the workspace (exclude admin)
  const teamMembers = await prisma.user.findMany({
    where: { role: "MEMBER" },
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
    <div className="space-y-5 sm:space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display uppercase text-[#071A49] tracking-tight">Workspace Team</h1>
          <p className="text-xs sm:text-[13px] font-medium text-[#586274] mt-0.5">
            All members in your workspace ({teamMembers.length})
          </p>
        </div>
        {admin && <AddMemberButton />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member: TeamMember) => {
          const memberships = member.projectMembships || [];
          const tasks = member.assignedTasks || [];
          const assignedCount = tasks.length;
          const completedCount = tasks.filter((t: MemberTask) => (t.status as string) === "DONE" || (t.status as string) === "COMPLETED").length;
          const isCurrentUser = member.id === currentUserId;

          return (
            <div
              key={member.id}
              className="bg-white border border-[#DDE2D8] rounded-[2px] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <Avatar name={member.name} src={member.avatar} size="lg" className="ring-1 ring-[#DDE2D8] rounded-[2px]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#071A49] truncate">
                      {member.name}
                    </h3>
                    {isCurrentUser && (
                      <span className="text-[9px] font-mono font-bold bg-[#F1F8CE] text-[#071A49] border border-[#B7D600] px-1.5 py-0.5 rounded-[2px] uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#586274] truncate flex items-center gap-1 mt-0.5 font-mono">
                    <Mail className="h-3 w-3 text-[#8E99A8]" />
                    {member.email}
                  </p>
                </div>
                {admin && !isCurrentUser && (
                  <div className="ml-auto">
                    <DeleteMemberButton memberId={member.id} memberName={member.name} />
                  </div>
                )}
              </div>

              {/* Shared Projects Chips */}
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#586274] block mb-1.5">
                  Projects ({memberships.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {memberships.length === 0 ? (
                    <span className="text-xs text-[#8E99A8] italic font-mono">No active projects</span>
                  ) : (
                    memberships.map((pm: MemberProjectMembership) => (
                      <span
                        key={pm.project.id}
                        className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#F8F9F6] border border-[#DDE2D8] px-2 py-0.5 rounded-[2px] text-[#071A49] font-medium"
                      >
                        <span className="text-[#8E99A8]"><ProjectIcon name={pm.project.icon} className="h-3 w-3" /></span>
                        <span className="truncate max-w-[120px]">{pm.project.name}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Task Workload Summary */}
              <div className="pt-3 border-t border-[#DDE2D8] flex items-center justify-between text-xs font-mono text-[#586274]">
                <div className="flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5 text-[#8E99A8]" />
                  <span>
                    <strong className="text-[#071A49]">{assignedCount}</strong> tasks
                  </span>
                </div>
                <div>
                  <strong className="text-emerald-700">{completedCount}</strong> completed
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
