import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear all existing data
  await prisma.messageRead.deleteMany();
  await prisma.messageReaction.deleteMany();
  await prisma.messageMention.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.file.deleteMany();
  await prisma.projectComment.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create super admin only
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@flowdesk.io",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      avatar: "/logo.png",
      onboardingComplete: true,
    },
  });

  console.log("✅ Database seeded.");
  console.log("🔑 Admin: admin@flowdesk.io / adminpassword123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
