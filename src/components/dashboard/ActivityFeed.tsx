import { formatRelative } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Activity, User } from "@prisma/client";

type ActivityItem = Activity & {
  user: Pick<User, "id" | "name" | "avatar">;
};

function getActivityDescription(activity: ActivityItem): string {
  let meta: Record<string, string> = {};
  try {
    meta = typeof activity.metadata === "string" ? JSON.parse(activity.metadata) : (activity.metadata as unknown as Record<string, string>);
  } catch {
    meta = {};
  }

  switch (activity.type) {
    case "PROJECT_CREATED": return `created project "${meta.projectName || ""}"`;
    case "MEMBER_ADDED": return `added ${meta.memberName || "a member"} to the project`;
    case "MEMBER_REMOVED": return `removed ${meta.memberName || "a member"} from the project`;
    case "TASK_CREATED": return `created task "${meta.taskTitle || ""}"`;
    case "TASK_ASSIGNED": return `assigned "${meta.taskTitle || ""}"`;
    case "TASK_STATUS_CHANGED": return `moved "${meta.taskTitle || ""}" to ${meta.to?.replace(/_/g, " ") || ""}`;
    case "TASK_PRIORITY_CHANGED": return `changed priority of "${meta.taskTitle || ""}" to ${meta.to || ""}`;
    case "TASK_COMPLETED": return `completed "${meta.taskTitle || ""}"`;
    case "COMMENT_ADDED": return `commented on "${meta.taskTitle || ""}"`;
    case "PROJECT_STATUS_CHANGED": return `changed project status to ${meta.to?.replace(/_/g, " ") || ""}`;
    case "FILE_UPLOADED": return `uploaded a file`;
    default: return "performed an action";
  }
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] px-4 py-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] divide-y divide-[var(--border-subtle)]">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-2.5 p-3">
          <Avatar name={activity.user.name} src={activity.user.avatar} size="xs" className="mt-0.5 flex-shrink-0 ring-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-primary)] leading-snug">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-[var(--text-secondary)]">{getActivityDescription(activity)}</span>
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {formatRelative(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
