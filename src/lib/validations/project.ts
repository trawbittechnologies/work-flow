import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional().nullable(),
  icon: z.string().optional(),
  status: z
    .enum(["PLANNING", "NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "REVIEW", "COMPLETED", "ARCHIVED", "CANCELLED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  leadId: z.string().nullable().optional().transform(v => v === "" ? null : v),
  startDate: z.string().nullable().optional().transform(v => v === "" ? null : v),
  deadline: z.string().nullable().optional().transform(v => v === "" ? null : v),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
