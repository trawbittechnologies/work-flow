import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Neon PostgreSQL database with Trawbit FlowDesk data...");

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.projectComment.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Team Users
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
  const memberPasswordHash = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@flowdesk.io",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      avatar: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  });

  const alexUser = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@flowdesk.io",
      passwordHash: memberPasswordHash,
      role: "MEMBER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah@flowdesk.io",
      passwordHash: memberPasswordHash,
      role: "MEMBER",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  const davidUser = await prisma.user.create({
    data: {
      name: "David Kim",
      email: "david@flowdesk.io",
      passwordHash: memberPasswordHash,
      role: "MEMBER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Create Primary Project: Trawbit Web App (Key: TRAW)
  const trawbitProject = await prisma.project.create({
    data: {
      name: "Trawbit Web App",
      key: "TRAW",
      description: "Main web application development project for Trawbit FlowDesk.",
      icon: "Code",
      status: "IN_PROGRESS",
      priority: "HIGH",
      ownerId: adminUser.id,
      leadId: alexUser.id,
      startDate: new Date("2026-08-01"),
      deadline: new Date("2026-10-31"),
      members: {
        create: [
          { userId: adminUser.id, role: "OWNER" },
          { userId: alexUser.id, role: "MEMBER" },
          { userId: sarahUser.id, role: "MEMBER" },
          { userId: davidUser.id, role: "MEMBER" },
        ],
      },
    },
  });

  // 3. Create Project Labels
  const epicE1Label = await prisma.label.create({ data: { name: "TRAW-E1 Auth & RBAC", color: "#6366F1", projectId: trawbitProject.id } });
  const epicE2Label = await prisma.label.create({ data: { name: "TRAW-E2 Task Engine", color: "#3B82F6", projectId: trawbitProject.id } });
  const epicE3Label = await prisma.label.create({ data: { name: "TRAW-E3 Search", color: "#8B5CF6", projectId: trawbitProject.id } });
  const epicE4Label = await prisma.label.create({ data: { name: "TRAW-E4 Realtime", color: "#EC4899", projectId: trawbitProject.id } });
  const epicE5Label = await prisma.label.create({ data: { name: "TRAW-E5 Admin Portal", color: "#10B981", projectId: trawbitProject.id } });

  const feLabel = await prisma.label.create({ data: { name: "Frontend", color: "#F59E0B", projectId: trawbitProject.id } });
  const beLabel = await prisma.label.create({ data: { name: "Backend", color: "#10B981", projectId: trawbitProject.id } });

  // 4. Seed Epics & User Stories (TRAW-1 through TRAW-9) + Subtasks
  const tasksData = [
    // --- Epic TRAW-E1: Authentication & User Management ---
    {
      title: "[TRAW-1] Implement OAuth2 & JWT User Login System",
      description: "As a Trawbit FlowDesk user, I want to securely log in using credentials or third-party OAuth2 providers (Google/GitHub) and receive an authenticated JWT session, so that I can safely access my workspace.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE1Label.id, feLabel.id, beLabel.id],
    },
    {
      title: "[TRAW-1.1] Setup NextAuth / JWT middleware on backend",
      description: "Sub-task for TRAW-1: Backend authentication options, JWT sign/verify algorithms, and refresh token rotation logic.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: sarahUser.id,
      labels: [epicE1Label.id, beLabel.id],
    },
    {
      title: "[TRAW-1.2] Build responsive login/signup UI components",
      description: "Sub-task for TRAW-1: Build React/Next.js components for Sign In, Sign Up, Password Reset, and Social OAuth buttons.",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE1Label.id, feLabel.id],
    },
    {
      title: "[TRAW-2] Role-Based Access Control (RBAC)",
      description: "As a System Admin or Team Lead, I want fine-grained permission enforcement distinguishing between System Admins, Project Managers, and Team Members.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: sarahUser.id,
      labels: [epicE1Label.id, beLabel.id],
    },
    {
      title: "[TRAW-2.1] Define permissions for System Admin vs. Team Member",
      description: "Sub-task for TRAW-2: RBAC permissions enum (ADMIN, MEMBER) and route protection middleware.",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      createdById: adminUser.id,
      assigneeId: sarahUser.id,
      labels: [epicE1Label.id, beLabel.id],
    },

    // --- Epic TRAW-E2: Project & Task Engine ---
    {
      title: "[TRAW-3] Project Lifecycle Management",
      description: "As a Project Manager, I want to create, configure, archive, and monitor workspace projects with automated progress tracking.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: davidUser.id,
      labels: [epicE2Label.id, feLabel.id, beLabel.id],
    },
    {
      title: "[TRAW-3.1] Create 'New Project' modal & backend CRUD endpoints",
      description: "Sub-task for TRAW-3: Prisma models, REST CRUD endpoints, and project creation form wizard.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: davidUser.id,
      labels: [epicE2Label.id, beLabel.id],
    },
    {
      title: "[TRAW-3.2] Build project progress tracking card",
      description: "Sub-task for TRAW-3: Interactive progress calculation UI based on completed task percentages.",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE2Label.id, feLabel.id],
    },
    {
      title: "[TRAW-4] Interactive Task Board (Kanban / List)",
      description: "As a Developer, I want an interactive, drag-and-drop task board supporting Kanban columns and status filtering.",
      status: "IN_PROGRESS" as const,
      priority: "URGENT" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE2Label.id, feLabel.id],
    },
    {
      title: "[TRAW-4.1] Build 'My Tasks' view with status filters",
      description: "Sub-task for TRAW-4: Filter toolbar for assignee, priority, and status.",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE2Label.id, feLabel.id],
    },
    {
      title: "[TRAW-4.2] Implement drag-and-drop state transitions",
      description: "Sub-task for TRAW-4: Integration with dnd-kit for fluid column movement and optimistic state updates.",
      status: "IN_PROGRESS" as const,
      priority: "URGENT" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE2Label.id, feLabel.id],
    },

    // --- Epic TRAW-E3: Search & Navigation ---
    {
      title: "[TRAW-5] Global Search Command Palette (⌘K)",
      description: "As a Power User, I want a global command palette accessible via Cmd+K or Ctrl+K to quickly search across projects, tasks, and users.",
      status: "IN_REVIEW" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: sarahUser.id,
      labels: [epicE3Label.id, feLabel.id],
    },
    {
      title: "[TRAW-5.1] Index projects, tasks, and team members for quick query search",
      description: "Sub-task for TRAW-5: Backend search API with full-text search across projects, tasks, and users.",
      status: "IN_REVIEW" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: sarahUser.id,
      labels: [epicE3Label.id, beLabel.id],
    },
    {
      title: "[TRAW-5.2] Keyboard shortcut integration (Cmd + K / Ctrl + K)",
      description: "Sub-task for TRAW-5: Global keydown listener and cmdk palette overlay implementation.",
      status: "DONE" as const,
      priority: "MEDIUM" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE3Label.id, feLabel.id],
    },

    // --- Epic TRAW-E4: Real-time Communication & Notifications ---
    {
      title: "[TRAW-6] Team Chat & Channels Module",
      description: "As a Team Member, I want direct messaging and project channel chat powered by WebSockets for real-time collaboration.",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      createdById: adminUser.id,
      assigneeId: davidUser.id,
      labels: [epicE4Label.id, feLabel.id, beLabel.id],
    },
    {
      title: "[TRAW-6.1] WebSocket integration for real-time direct & group messaging",
      description: "Sub-task for TRAW-6: Socket.io/Ably connection handling and message persistence.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: davidUser.id,
      labels: [epicE4Label.id, beLabel.id],
    },
    {
      title: "[TRAW-7] In-App Notification Center",
      description: "As a User, I want instant push notifications and an in-app notification center when assigned to tasks or mentioned.",
      status: "DONE" as const,
      priority: "MEDIUM" as const,
      createdById: adminUser.id,
      assigneeId: sarahUser.id,
      labels: [epicE4Label.id, feLabel.id, beLabel.id],
    },
    {
      title: "[TRAW-7.1] Push notifications on task assignment, status update, or direct mention",
      description: "Sub-task for TRAW-7: Notification trigger handlers and unread notification tray badge.",
      status: "DONE" as const,
      priority: "MEDIUM" as const,
      createdById: adminUser.id,
      assigneeId: sarahUser.id,
      labels: [epicE4Label.id, feLabel.id],
    },

    // --- Epic TRAW-E5: Admin Portal & Workspace Settings ---
    {
      title: "[TRAW-8] System Admin Dashboard Overview",
      description: "As a System Administrator, I want a high-level admin dashboard displaying active project metrics, server health, and audit logs.",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: adminUser.id,
      labels: [epicE5Label.id, feLabel.id, beLabel.id],
    },
    {
      title: "[TRAW-8.1] Active project metrics, server health, and team activity logs",
      description: "Sub-task for TRAW-8: Admin analytics widgets, system uptime counter, and activity log streamer.",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      createdById: adminUser.id,
      assigneeId: adminUser.id,
      labels: [epicE5Label.id, beLabel.id],
    },
    {
      title: "[TRAW-9] Organization Profile & Preferences",
      description: "As a User, I want to manage my personal profile settings (avatar upload, email display, job title/designation).",
      status: "DONE" as const,
      priority: "LOW" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE5Label.id, feLabel.id],
    },
    {
      title: "[TRAW-9.1] User profile update (Avatar, email, designation)",
      description: "Sub-task for TRAW-9: User profile API endpoint and profile configuration settings page.",
      status: "DONE" as const,
      priority: "LOW" as const,
      createdById: adminUser.id,
      assigneeId: alexUser.id,
      labels: [epicE5Label.id, feLabel.id],
    },
  ];

  for (const t of tasksData) {
    const { labels, ...taskField } = t;
    const createdTask = await prisma.task.create({
      data: {
        ...taskField,
        projectId: trawbitProject.id,
      },
    });

    for (const labelId of labels) {
      await prisma.taskLabel.create({
        data: {
          taskId: createdTask.id,
          labelId,
        },
      });
    }
  }

  // 5. Seed Activities
  await prisma.activity.create({
    data: {
      projectId: trawbitProject.id,
      userId: adminUser.id,
      type: "PROJECT_CREATED",
      metadata: { name: trawbitProject.name, key: trawbitProject.key },
    },
  });

  await prisma.activity.create({
    data: {
      projectId: trawbitProject.id,
      userId: alexUser.id,
      type: "TASK_CREATED",
      metadata: { title: "[TRAW-4] Interactive Task Board (Kanban / List)" },
    },
  });

  console.log("------------------------------------------------");
  console.log("✅ Trawbit FlowDesk Database seeded successfully!");
  console.log("📌 Project: Trawbit Web App (Key: TRAW)");
  console.log(`📋 Total Tasks Created: ${tasksData.length}`);
  console.log("🔑 Admin Login:  admin@flowdesk.io / adminpassword123 (Role: ADMIN)");
  console.log("🔑 Member Login: alex@flowdesk.io  / password123 (Role: MEMBER)");
  console.log("------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

