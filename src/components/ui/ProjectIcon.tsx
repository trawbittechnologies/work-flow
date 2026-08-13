import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectIconName = keyof typeof icons;

export const PROJECT_ICONS: ProjectIconName[] = [
  "Clipboard", "Rocket", "Lightbulb", "Target", "Wrench",
  "Star", "Flame", "Briefcase", "Construction", "Palette",
  "BarChart", "Microscope", "Leaf", "Gamepad2", "Smartphone",
  "Monitor", "Bot", "Lock", "Package", "Globe"
];

export function ProjectIcon({ name, className }: { name?: string | null, className?: string }) {
  // If the name is an emoji or not in lucide-react, fallback to Clipboard
  const IconComponent = (name && name in icons) 
    ? icons[name as ProjectIconName] 
    : icons.Clipboard;

  return <IconComponent className={cn("h-5 w-5", className)} />;
}
