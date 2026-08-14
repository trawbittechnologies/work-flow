import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { calculateProgress, formatDate, isOverdue, cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/Avatar";
import { ProjectNav } from "@/components/projects/ProjectNav";
import { CalendarDays, ShieldCheck, Plus, Star } from "lucide-react";
import Link from "next/link";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import { isAdmin } from "@/lib/role";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
};

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const admin = await isAdmin(session.user.id);

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
    include: {
      project: {
        include: {
          owner: { select: { id: true, name: true, email: true, avatar: true } },
          lead: { select: { id: true, name: true, email: true, avatar: true } },
          members: {
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
          },
          tasks: {
            where: admin ? undefined : { assigneeId: session.user.id },
            select: { id: true, status: true },
          },
        },
      },
    },
  });

  // Admin can view any project even if not a member
  if (!member && !admin) notFound();

  // If admin but not a member, fetch the project directly
  const project = member?.project ?? await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      lead: { select: { id: true, name: true, email: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      },
      tasks: {
        where: admin ? undefined : { assigneeId: session.user.id },
        select: { id: true, status: true },
      },
    },
  });

  if (!project) notFound();

  const completedTasks = project.tasks.filter((t: { status: string }) => t.status === "DONE" || t.status === "COMPLETED").length;
  const totalTasks = project.tasks.length;
  const progress = calculateProgress(completedTasks, totalTasks);
  const overdueDeadline = project.deadline ? isOverdue(project.deadline) : false;
  const userRole = (admin || member?.role === "OWNER" || project.ownerId === session.user.id || project.leadId === session.user.id) ? "OWNER" : "MEMBER";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Project Header */}
      <div className="bg-white border border-[#EAEDF2] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 sm:space-y-5 relative overflow-hidden">
        {/* Subtle accent gradient at the top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#88C315] to-[#98CD28] opacity-80" />
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 relative z-10">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-[#F3F9DE] text-[#88C315] border border-[#88C315]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <ProjectIcon name={project.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight truncate">
                  {project.name}
                </h1>
                {/* Project Key Badge */}
                <span className="text-[10px] sm:text-[11px] font-bold font-mono bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563] px-2 py-0.5 rounded">
                  {project.key}
                </span>
                <StatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>
              {project.description && (
                <p className="text-xs sm:text-sm font-medium text-[#6B7280] mt-1 max-w-2xl line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAEDF2]">
            <div className="text-left sm:text-right">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] block mb-0.5">Progress</span>
              <span className="text-xs sm:text-sm font-bold text-[#111827]">
                {progress}% <span className="text-[#9CA3AF] font-medium">({completedTasks}/{totalTasks})</span>
              </span>
              {/* Progress Bar */}
              <div className="w-20 sm:w-24 h-1.5 bg-[#F3F4F6] rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-[#88C315] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AvatarGroup
                users={project.members.map((m: { user?: { name?: string; avatar?: string | null } }) => ({ name: m.user?.name || "Unknown", avatar: m.user?.avatar }))}
                max={4}
                size="sm"
              />
              <Link 
                href={`/projects/${projectId}/team`}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-dashed border-[#D1D5DB] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:border-[#9CA3AF] transition-colors bg-[#F9FAFB] hover:bg-white"
                title="Add team member"
              >
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs font-medium text-[#6B7280] pt-2.5 sm:pt-3 border-t border-[#EAEDF2] relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#88C315]" />
            <span>Owner: <strong className="text-[#111827] font-semibold">{project.owner?.name || "Workspace"}</strong></span>
          </div>

          {/* Project Lead */}
          {project.lead && (
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>Lead: <strong className="text-[#111827] font-semibold">{project.lead?.name || "Team Lead"}</strong></span>
            </div>
          )}

          {project.startDate && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#9CA3AF]" />
              <span>Started: {formatDate(project.startDate)}</span>
            </div>
          )}

          {project.deadline && (
            <div className={cn("flex items-center gap-1.5", overdueDeadline ? "text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded" : "")}>
              <CalendarDays className="h-3.5 w-3.5 text-[#9CA3AF]" />
              <span>
                Deadline: {formatDate(project.deadline)} {overdueDeadline && "(Overdue)"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="relative z-10">
          <ProjectNav projectId={projectId} userRole={userRole} />
        </div>
      </div>

      {/* Main Content View */}
      <div>{children}</div>
    </div>
  );
}
