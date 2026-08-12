import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Project Activity" };

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectActivityPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const isMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!isMember) notFound();

  const activities = await prisma.activity.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-base font-bold text-[var(--text-primary)]">Project Timeline</h2>
        <p className="text-xs text-[var(--text-muted)]">Complete audit log of project changes and events</p>
      </div>

      <ActivityFeed activities={activities} />
    </div>
  );
}
