import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatDate, formatRelative, cn, isOverdue } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { Download, Trash2, FileText, Image, File, Upload } from "lucide-react";
import type { Metadata } from "next";
import { FilesManager } from "@/components/projects/FilesManager";

export const metadata: Metadata = { title: "Project Files" };

type PageProps = { params: Promise<{ projectId: string }> };

export default async function ProjectFilesPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const isMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!isMember) notFound();

  const files = await prisma.file.findMany({
    where: { projectId, taskId: null },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedFiles = files.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    size: f.size,
    mimeType: f.mimeType,
    createdAt: f.createdAt.toISOString(),
    user: f.user,
    userId: f.userId,
  }));

  return (
    <FilesManager
      projectId={projectId}
      initialFiles={formattedFiles}
      currentUserId={session.user.id}
      userRole={isMember.role as "OWNER" | "MEMBER"}
    />
  );
}
