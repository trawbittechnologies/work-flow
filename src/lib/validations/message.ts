import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
