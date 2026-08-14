import React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export const PROJECT_ICONS = [
  "FolderKanban", "Rocket", "Globe", "Smartphone", "LayoutGrid",
  "Palette", "Wrench", "Megaphone", "Layers", "Briefcase",
  "Target", "Flame", "Star", "ChartBar", "Bot",
  "Lock", "Package", "Leaf", "Gamepad2", "Monitor"
] as const;

export type ProjectIconName = typeof PROJECT_ICONS[number];

// Fast lowercase lookup map for Lucide icon components
const iconLookupMap = new Map<string, React.ComponentType<{ className?: string }>>();

Object.entries(LucideIcons).forEach(([key, component]) => {
  if (typeof component === "function" || (typeof component === "object" && component !== null)) {
    const comp = component as unknown as React.ComponentType<{ className?: string }>;
    iconLookupMap.set(key.toLowerCase(), comp);
    // Also strip hyphens/underscores for flexible matching
    iconLookupMap.set(key.toLowerCase().replace(/[-_]/g, ""), comp);
  }
});

interface ProjectIconProps {
  name?: string | React.ComponentType<{ className?: string }> | null;
  className?: string;
}

export function ProjectIcon({ name, className }: ProjectIconProps) {
  if (!name) {
    const Fallback = LucideIcons.FolderKanban || LucideIcons.Folder;
    return <Fallback className={cn("h-5 w-5", className)} />;
  }

  // If already a React component / element
  if (typeof name === "function" || (typeof name === "object" && React.isValidElement(name))) {
    if (React.isValidElement(name)) {
      return React.cloneElement(name as React.ReactElement<{ className?: string }>, {
        className: cn("h-5 w-5", className),
      });
    }
    const CustomComp = name as React.ComponentType<{ className?: string }>;
    return <CustomComp className={cn("h-5 w-5", className)} />;
  }

  // If name is string
  if (typeof name === "string") {
    const cleanName = name.trim();

    // Check if it's an emoji (e.g. 🚀, 💻, 🎨)
    if (/\p{Extended_Pictographic}/u.test(cleanName) && cleanName.length <= 4) {
      return (
        <span className={cn("text-base leading-none select-none", className)}>
          {cleanName}
        </span>
      );
    }

    // Direct lookup in lucide icons map
    const allIcons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const directComp = allIcons[cleanName];
    if (directComp) {
      const Icon = directComp;
      return <Icon className={cn("h-5 w-5", className)} />;
    }

    // Case-insensitive / normalized lookup
    const normalizedKey = cleanName.toLowerCase().replace(/[-_\s]/g, "");
    const normalizedComp = iconLookupMap.get(normalizedKey);
    if (normalizedComp) {
      const Icon = normalizedComp;
      return <Icon className={cn("h-5 w-5", className)} />;
    }
  }

  // Default fallback
  const DefaultIcon = LucideIcons.FolderKanban || LucideIcons.Folder;
  return <DefaultIcon className={cn("h-5 w-5", className)} />;
}
