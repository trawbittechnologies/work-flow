"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function addTeamMember(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = addMemberSchema.safeParse(data);

    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
          name
        )}&backgroundColor=e0e7ff`,
      },
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Failed to add team member:", error);
    return { error: "An unexpected error occurred while adding the member." };
  }
}
