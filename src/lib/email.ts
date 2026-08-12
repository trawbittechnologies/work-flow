import nodemailer from "nodemailer";

const port = parseInt(process.env.SMTP_PORT || "465");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port,
  secure: process.env.SMTP_SECURE === "true" || port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmailNotification({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP credentials missing. Email not sent:", subject);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Flowdesk" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}
