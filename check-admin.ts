import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function checkAdmin() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@flowdesk.io" }
  });
  
  if (!admin) {
    console.log("Admin not found in DB!");
    return;
  }
  
  console.log("Admin found:", admin.email);
  const isValid = await bcrypt.compare("adminpassword123", admin.passwordHash);
  console.log("Password is valid:", isValid);
}

checkAdmin().finally(() => prisma.$disconnect());
