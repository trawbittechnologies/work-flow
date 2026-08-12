import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: { container: "h-5 w-5", text: "text-[9px]", img: 20 },
  sm: { container: "h-6 w-6", text: "text-[10px]", img: 24 },
  md: { container: "h-8 w-8", text: "text-xs", img: 32 },
  lg: { container: "h-10 w-10", text: "text-sm", img: 40 },
  xl: { container: "h-14 w-14", text: "text-base", img: 56 },
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const { container, text, img } = sizeMap[size];
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  if (src) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--surface)]",
          container,
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          width={img}
          height={img}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white ring-2 ring-[var(--surface)]",
        container,
        text,
        bgColor,
        className
      )}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  users: { name: string; avatar?: string | null }[];
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = "sm", className }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((user, i) => (
        <div key={i} className={i > 0 ? "-ml-1.5" : ""} style={{ zIndex: visible.length - i }}>
          <Avatar name={user.name} src={user.avatar} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "-ml-1.5 rounded-full flex items-center justify-center text-[10px] font-semibold",
            "bg-[var(--border)] text-[var(--text-secondary)] ring-2 ring-[var(--surface)]",
            sizeMap[size].container
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
