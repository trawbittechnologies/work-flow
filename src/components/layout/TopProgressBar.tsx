"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger loading on link clicks across the document
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      // Check if it's an internal link
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        target.target !== "_blank" &&
        href !== pathname
      ) {
        setLoading(true);
        setProgress(30);

        const timer1 = setTimeout(() => setProgress(70), 150);
        const timer2 = setTimeout(() => setProgress(90), 400);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [pathname]);

  // When pathname or searchParams change, finish the loading bar
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Top glowing loading bar */}
      <div
        className="h-[2.5px] bg-gradient-to-r from-[#B7D600] via-[#D1E838] to-[#B7D600] transition-all duration-200 ease-out shadow-[0_0_8px_rgba(183,214,0,0.9)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
