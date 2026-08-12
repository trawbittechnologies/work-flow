/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Neon PostgreSQL database...");

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin & Teammate Users
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
  const userPasswordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@flowdesk.io",
      passwordHash: adminPasswordHash,
      avatar: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@flowdesk.io",
      passwordHash: userPasswordHash,
      avatar: "https://avatars.githubusercontent.com/u/101?v=4",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah@flowdesk.io",
      passwordHash: userPasswordHash,
      avatar: "https://avatars.githubusercontent.com/u/102?v=4",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "marcus@flowdesk.io",
      passwordHash: userPasswordHash,
      avatar: "https://avatars.githubusercontent.com/u/103?v=4",
    },
  });

  console.log(
    "👤 Created Admin (admin@flowdesk.io / adminpassword123) and 3 team members"
  );

  // Create Project 1: Web App Redesign (Owned by Admin)
  const project1 = await prisma.project.create({
    data: {
      name: "Flowdesk Web Platform",
      description:
        "Modernizing the Next.js frontend with Linear-inspired UI polish and real-time kanban tracking.",
      icon: "🚀",
      status: "IN_PROGRESS" as any,
      ownerId: admin.id,
      startDate: new Date("2026-08-01"),
      deadline: new Date("2026-09-15"),
      members: {
        create: [
          { userId: admin.id, role: "OWNER" as any },
          { userId: alex.id, role: "MEMBER" as any },
          { userId: sarah.id, role: "MEMBER" as any },
          { userId: marcus.id, role: "MEMBER" as any },
        ],
      },
    },
  });

  // Create Project 2: Mobile Client (Owned by Admin)
  await prisma.project.create({
    data: {
      name: "Mobile App Companion",
      description:
        "React Native mobile workspace client for fast task tracking on iOS & Android.",
      icon: "📱",
      status: "PLANNING" as any,
      ownerId: admin.id,
      startDate: new Date("2026-08-10"),
      deadline: new Date("2026-10-01"),
      members: {
        create: [
          { userId: admin.id, role: "OWNER" as any },
          { userId: sarah.id, role: "MEMBER" as any },
          { userId: alex.id, role: "MEMBER" as any },
        ],
      },
    },
  });

  console.log("📋 Created 2 projects owned by Admin");

  // Create Tasks for Project 1
  await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Design Linear-inspired Kanban Board UI",
      description:
        "Implement dnd-kit drag and drop with smooth status column transitions.",
      status: "DONE" as any,
      priority: "HIGH" as any,
      assigneeId: admin.id,
      createdById: admin.id,
      dueDate: new Date("2026-08-10"),
    },
  });

  const t2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Auth.js v5 Middleware Integration",
      description:
        "Set up server-side auth checking for all protected project routes.",
      status: "DONE" as any,
      priority: "URGENT" as any,
      assigneeId: sarah.id,
      createdById: admin.id,
      dueDate: new Date("2026-08-12"),
    },
  });

  const t3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Implement Real-time Project Chat",
      description:
        "Build project-scoped messaging panel with instant composer and notification alerts.",
      status: "IN_PROGRESS" as any,
      priority: "HIGH" as any,
      assigneeId: marcus.id,
      createdById: admin.id,
      dueDate: new Date("2026-08-18"),
    },
  });

  await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Global Search with Cmd+K Keyboard Shortcut",
      description:
        "Index projects, tasks, and users for instant modal search execution.",
      status: "REVIEW" as any,
      priority: "MEDIUM" as any,
      assigneeId: alex.id,
      createdById: admin.id,
      dueDate: new Date("2026-08-15"),
    },
  });

  await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Dark Mode & Glassmorphism Design Tokens",
      description:
        "Refine CSS custom properties for vibrant light and dark theme contrast.",
      status: "TODO" as any,
      priority: "LOW" as any,
      assigneeId: sarah.id,
      createdById: marcus.id,
      dueDate: new Date("2026-08-22"),
    },
  });

  console.log("✅ Created 5 tasks");

  // Create Comments
  await prisma.taskComment.create({
    data: {
      taskId: t3.id,
      userId: sarah.id,
      content:
        "I tested the message composer! Polling works cleanly without latency.",
    },
  });

  await prisma.taskComment.create({
    data: {
      taskId: t3.id,
      userId: marcus.id,
      content: "Great! Working on adding unread notification badges next.",
    },
  });

  // Create Project Messages
  await prisma.message.create({
    data: {
      projectId: project1.id,
      userId: admin.id,
      content:
        "Welcome to Flowdesk! All core project views are configured and ready.",
    },
  });

  await prisma.message.create({
    data: {
      projectId: project1.id,
      userId: sarah.id,
      content: "Awesome! The Kanban board drag and drop feels super fast.",
    },
  });

  // Create Activities
  await prisma.activity.create({
    data: {
      projectId: project1.id,
      userId: admin.id,
      type: "PROJECT_CREATED" as any,
      metadata: { projectName: project1.name } as any,
    },
  });

  await prisma.activity.create({
    data: {
      projectId: project1.id,
      userId: sarah.id,
      type: "TASK_STATUS_CHANGED" as any,
      metadata: {
        taskId: t2.id,
        taskTitle: t2.title,
        from: "IN_PROGRESS",
        to: "DONE",
      } as any,
    },
  });

  console.log("🎉 Neon PostgreSQL seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
