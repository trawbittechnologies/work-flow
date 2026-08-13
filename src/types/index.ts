import type {
  User,
  Project,
  ProjectMember,
  Task,
  TaskComment,
  ProjectComment,
  Message,
  Notification,
  Activity,
  Label,
} from "@prisma/client";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type {
  User,
  Project,
  ProjectMember,
  Task,
  TaskComment,
  ProjectComment,
  Message,
  Notification,
  Activity,
  Label,
};

// ─── Extended Types ───────────────────────────────────────────────────────────

export type ProjectWithDetails = Project & {
  owner: Pick<User, "id" | "name" | "email" | "avatar">;
  lead: Pick<User, "id" | "name" | "email" | "avatar"> | null;
  members: (ProjectMember & {
    user: Pick<User, "id" | "name" | "email" | "avatar">;
  })[];
  tasks: Task[];
  _count: {
    tasks: number;
    members: number;
  };
};

export type ProjectWithProgress = Project & {
  owner: Pick<User, "id" | "name" | "email" | "avatar">;
  lead: Pick<User, "id" | "name" | "email" | "avatar"> | null;
  members: (ProjectMember & {
    user: Pick<User, "id" | "name" | "email" | "avatar">;
  })[];
  tasks: Pick<Task, "id" | "status">[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
};

export type TaskWithDetails = Task & {
  assignee: Pick<User, "id" | "name" | "email" | "avatar"> | null;
  createdBy: Pick<User, "id" | "name" | "email" | "avatar">;
  project: Pick<Project, "id" | "name" | "icon" | "key">;
  labels: (import("@prisma/client").TaskLabel & { label: Label })[];
  comments: (TaskComment & {
    user: Pick<User, "id" | "name" | "avatar">;
    replies?: (TaskComment & { user: Pick<User, "id" | "name" | "avatar"> })[];
  })[];
  _count: {
    comments: number;
    files?: number;
  };
};

export type CommentWithUser = TaskComment & {
  user: Pick<User, "id" | "name" | "avatar">;
  replies?: (TaskComment & { user: Pick<User, "id" | "name" | "avatar"> })[];
};

export type ProjectCommentWithUser = ProjectComment & {
  user: Pick<User, "id" | "name" | "avatar">;
  replies?: (ProjectComment & { user: Pick<User, "id" | "name" | "avatar"> })[];
};

export type MessageWithUser = Message & {
  sender?: Pick<User, "id" | "name" | "avatar">;
  user?: Pick<User, "id" | "name" | "avatar">;
};

export type NotificationWithProject = Notification & {
  project: Pick<Project, "id" | "name" | "icon"> | null;
  task: Pick<Task, "id" | "title"> | null;
};

export type ActivityWithUser = Activity & {
  user: Pick<User, "id" | "name" | "avatar">;
};

export type MemberWithUser = ProjectMember & {
  user: Pick<User, "id" | "name" | "email" | "avatar">;
  assignedTasks: number;
  completedTasks: number;
};

// ─── API Response Types ───────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export type DashboardStats = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingTasks: number;
  overdueTasks: number;
  totalMembers?: number;
};

// ─── Session User ─────────────────────────────────────────────────────────────

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: "ADMIN" | "MEMBER";
};
