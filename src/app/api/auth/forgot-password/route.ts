import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendEmailNotification } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always respond with success to prevent email enumeration
    if (!user || !user.isActive) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we have sent password reset instructions.",
      });
    }

    // Delete existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email
    await sendEmailNotification({
      to: email,
      subject: "Reset your Flowdesk password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px;">
          <div style="margin-bottom: 24px;">
            <h2 style="color: #0F172A; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">Reset Your Password</h2>
            <p style="color: #64748B; font-size: 14px; margin: 0;">Hi ${user.name || "there"},</p>
          </div>
          
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            We received a request to reset the password for your <strong>Trawbit FlowDesk</strong> account. Click the button below to choose a new password:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background-color: #88C315; color: #0F172A; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
              Reset Password
            </a>
          </div>

          <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
            This link will expire in <strong>1 hour</strong>. If you did not request this password reset, you can safely ignore this email — your account remains secure.
          </p>

          <div style="border-top: 1px solid #E2E8F0; padding-top: 16px; margin-top: 24px;">
            <p style="color: #94A3B8; font-size: 11px; margin: 0 0 6px 0;">If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #0284C7; font-size: 11px; word-break: break-all; margin: 0;">${resetUrl}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we have sent password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
