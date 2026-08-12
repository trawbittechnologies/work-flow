"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmailNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
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

    const { name, email } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    // Generate automatic password
    const generatedPassword = crypto.randomBytes(6).toString('hex'); // 12 chars
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

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

    // Send email with password
    await sendEmailNotification({
      to: email.toLowerCase(),
      subject: "Welcome to Flowdesk",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #172B4D;">
          <h2 style="color: #C3D946; background: #172B4D; padding: 16px; border-radius: 8px;">Welcome to Flowdesk!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>You have been added to the workspace.</p>
          <p>Your temporary password is: <strong style="background: #F4F5F7; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px;">${generatedPassword}</strong></p>
          <p>Please log in and change your password as soon as possible.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 10px 20px; background-color: #C3D946; color: #172B4D; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Log in to Flowdesk</a>
        </div>
      `
    });

    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    console.error("Failed to add team member:", error);
    return { error: "An unexpected error occurred while adding the member." };
  }
}
