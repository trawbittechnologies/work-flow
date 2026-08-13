import React from "react";
import { cn } from "@/lib/utils";

interface TrawbitLogoIconProps {
  className?: string;
  size?: number;
}

export function TrawbitLogoIcon({ className, size = 32 }: TrawbitLogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
    >
      {/* Lime Green Circle Background */}
      <circle cx="50" cy="50" r="50" fill="#98CD28" />

      {/* Stylized White "T" with curved stem & digital pixel dispersion */}
      {/* Curved lower stem */}
      <path
        d="M39 80C39 70 41 58 48 50V38H30V26H58V50C53 58 51 68 51 80H39Z"
        fill="white"
      />
      
      {/* Top right pixel cluster dispersing */}
      <rect x="62" y="26" width="8" height="8" rx="1" fill="white" />
      <rect x="72" y="26" width="6" height="6" rx="1" fill="white" />
      <rect x="62" y="36" width="7" height="7" rx="1" fill="white" />
      <rect x="71" y="34" width="5" height="5" rx="1" fill="white" />
      <rect x="78" y="32" width="4" height="4" rx="1" fill="white" />
      <rect x="68" y="20" width="5" height="5" rx="1" fill="white" />
      <rect x="75" y="22" width="4" height="4" rx="1" fill="white" />
      <rect x="80" y="26" width="3" height="3" rx="0.5" fill="white" />
    </svg>
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
