// Force TS Refresh
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Neon PostgreSQL database...");

  // Clean existing data (cascading deletes will handle relations)
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);

  await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@flowdesk.io",
      passwordHash: adminPasswordHash,
      avatar: "https://avatars.githubusercontent.com/u/1?v=4",
    },
  });

  console.log(
    "👤 Created Admin (admin@flowdesk.io / adminpassword123)"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
