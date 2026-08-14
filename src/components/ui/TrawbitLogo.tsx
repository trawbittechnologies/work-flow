import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TrawbitLogoIconProps {
  className?: string;
  size?: number;
}

export function TrawbitLogoIcon({ className, size = 32 }: TrawbitLogoIconProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg flex-shrink-0 flex items-center justify-center shadow-2xs",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Trawbit Logo"
        width={size}
        height={size}
        className="w-full h-full object-cover rounded-lg"
        priority
      />
    </div>
  );
}

interface TrawbitLogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
}

export function TrawbitLogo({
  className,
  iconSize = 32,
  showText = true,
}: TrawbitLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <TrawbitLogoIcon size={iconSize} className="shadow-2xs" />
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[17px] font-black text-[#111827] tracking-tight">
            Trawbit
          </span>
          <span className="text-[17px] font-black text-[#98CD28] tracking-tight">
            FlowDesk
          </span>
        </div>
      )}
    </div>
  );
}
