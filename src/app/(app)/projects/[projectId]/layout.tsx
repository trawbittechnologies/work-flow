import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { calculateProgress, formatDate, isOverdue } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/Avatar";
import { ProjectNav } from "@/components/projects/ProjectNav";
import { CalendarDays, ShieldCheck } from "lucide-react";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
};

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
    include: {
      project: {
        include: {
          owner: { select: { id: true, name: true, email: true, avatar: true } },
          members: {
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
          },
          tasks: { select: { id: true, status: true } },
        },
      },
    },
  });

  if (!member) notFound();

  const { project } = member;
  const completedTasks = project.tasks.filter((t: { status: string }) => t.status === "DONE").length;
  const totalTasks = project.tasks.length;
  const progress = calculateProgress(completedTasks, totalTasks);
  const overdueDeadline = project.deadline ? isOverdue(project.deadline) : false;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-[10px] bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
              {project.icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-[var(--text-muted)] block">Progress</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {progress}% ({completedTasks}/{totalTasks} tasks)
              </span>
            </div>
            <AvatarGroup
              users={project.members.map((m: { user: { name: string; avatar?: string | null } }) => ({ name: m.user.name, avatar: m.user.avatar }))}
              max={5}
              size="sm"
            />
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Owner: <strong className="text-[var(--text-primary)] font-medium">{project.owner.name}</strong></span>
          </div>

          {project.startDate && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Started: {formatDate(project.startDate)}</span>
            </div>
          )}

          {project.deadline && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className={`h-3.5 w-3.5 ${overdueDeadline ? "text-red-500" : ""}`} />
              <span className={overdueDeadline ? "text-red-500 font-medium" : ""}>
                Deadline: {formatDate(project.deadline)} {overdueDeadline && "(Overdue)"}
              </span>
            </div>
          )}

          <div className="sm:hidden ml-auto">
            <span className="font-semibold text-[var(--text-primary)]">{progress}%</span> complete
          </div>
        </div>

        {/* Navigation Tabs */}
        <ProjectNav projectId={projectId} userRole={member.role as "OWNER" | "MEMBER"} />
      </div>

      {/* Main Content View */}
      <div>{children}</div>
    </div>
  );
}
