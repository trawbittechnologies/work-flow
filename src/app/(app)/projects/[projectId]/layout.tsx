import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { calculateProgress, formatDate, isOverdue, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/Avatar";
import { ProjectNav } from "@/components/projects/ProjectNav";
import { CalendarDays, ShieldCheck, Plus } from "lucide-react";
import Link from "next/link";

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
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5 relative overflow-hidden">
        {/* Subtle accent gradient at the top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-70" />
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
              {project.icon}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-sm font-medium text-text-secondary mt-1.5 max-w-2xl line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-0.5">Progress</span>
              <span className="text-sm font-bold text-text-primary">
                {progress}% <span className="text-text-muted font-medium">({completedTasks}/{totalTasks})</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AvatarGroup
                users={project.members.map((m: { user?: { name?: string; avatar?: string | null } }) => ({ name: m.user?.name || "Unknown", avatar: m.user?.avatar }))}
                max={5}
                size="sm"
              />
              <Link 
                href={`/projects/${projectId}/team`}
                className="h-8 w-8 rounded-full border border-dashed border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border transition-colors bg-surface-alt hover:bg-surface"
                title="Add team member"
              >
                <Plus className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-text-muted pt-3 border-t border-border-subtle relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Owner: <strong className="text-text-primary font-semibold">{project.owner.name}</strong></span>
          </div>

          {project.startDate && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>Started: {formatDate(project.startDate)}</span>
            </div>
          )}

          {project.deadline && (
            <div className={cn("flex items-center gap-1.5", overdueDeadline ? "text-danger bg-danger-subtle px-1.5 py-0.5 rounded" : "")}>
              <CalendarDays className="h-4 w-4" />
              <span>
                Deadline: {formatDate(project.deadline)} {overdueDeadline && "(Overdue)"}
              </span>
            </div>
          )}

          <div className="sm:hidden ml-auto">
            <span className="font-bold text-text-primary">{progress}%</span> complete
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10">
          <ProjectNav projectId={projectId} userRole={member.role as "OWNER" | "MEMBER"} />
        </div>
      </div>

      {/* Main Content View */}
      <div>{children}</div>
    </div>
  );
}
