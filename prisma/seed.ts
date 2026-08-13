import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Neon PostgreSQL database...");

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

  // Create Admin
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@flowdesk.io",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      avatar: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  });

  // Create Member
  const memberPasswordHash = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@flowdesk.io",
      passwordHash: memberPasswordHash,
      role: "MEMBER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // Create Sample Project
  const sampleProject = await prisma.project.create({
    data: {
      name: "Trawbit Web App",
      key: "TWA1",
      description: "Main web application development project for Trawbit FlowDesk.",
      icon: "Code",
      status: "IN_PROGRESS",
      priority: "HIGH",
      ownerId: adminUser.id,
      leadId: demoUser.id,
      members: {
        create: [
          { userId: adminUser.id, role: "OWNER" },
          { userId: demoUser.id, role: "MEMBER" },
        ],
      },
      tasks: {
        create: [
          {
            title: "Setup Auth & Roles",
            description: "Implement Admin and Member role checks",
            status: "DONE",
            priority: "HIGH",
            createdById: adminUser.id,
            assigneeId: demoUser.id,
          },
          {
            title: "Design Admin Dashboard",
            description: "Build overview stats and project tables",
            status: "IN_PROGRESS",
            priority: "URGENT",
            createdById: adminUser.id,
            assigneeId: adminUser.id,
          },
        ],
      },
    },
  });

  console.log("------------------------------------------------");
  console.log("✅ Database seeded successfully!");
  console.log("🔑 Admin Login: admin@flowdesk.io / adminpassword123 (Role: ADMIN)");
  console.log("🔑 Member Login: alex@flowdesk.io / password123 (Role: MEMBER)");
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
