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
      <div className="bg-surface border border-border rounded-2xl px-4 py-10 text-center card-shadow">
        <p className="text-sm font-semibold text-text-muted">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl card-shadow divide-y divide-border-subtle overflow-hidden">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3 p-3.5 hover:bg-surface-alt/40 transition-colors">
          <Avatar name={activity.user.name} src={activity.user.avatar} size="xs" className="mt-0.5 flex-shrink-0 ring-1 ring-border" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-primary leading-relaxed">
              <span className="font-bold text-text-primary">{activity.user.name}</span>{" "}
              <span className="text-text-secondary font-medium">{getActivityDescription(activity)}</span>
            </p>
            <p className="text-[10px] font-semibold text-text-muted mt-1">
              {formatRelative(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
