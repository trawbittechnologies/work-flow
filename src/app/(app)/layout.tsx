import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ForceLogout } from "@/components/auth/ForceLogout";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import { AblyProvider } from "@/components/chat/AblyProvider";
import { Suspense } from "react";
import { TopProgressBar } from "@/components/layout/TopProgressBar";
import { CommandCenter } from "@/components/ui/CommandCenter";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, read: false },
    }),
  ]);

  if (!user) return <ForceLogout />;

  return (
    <AblyProvider>
      <div className="min-h-screen bg-background">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <Sidebar user={user} unreadNotifications={unreadCount} />
        <Header user={user} unreadNotifications={unreadCount} />
        <CommandCenter />
        <main
          className="md:ml-[var(--sidebar-width)] pt-[var(--header-height)] pb-16 md:pb-0 min-h-screen transition-all duration-200 ease-in-out"
          id="main-content"
        >
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in">
            {children}
          </div>
        </main>
        <MobileNav unreadNotifications={unreadCount} />
        <NotificationManager 
          userId={user.id} 
          vapidPublicKey={process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BBmlN8JNRmRGplWVsYDDZpMyBtKbGUzSbYw-hXeZohNcnxbhSJbm4scyz7n6vDp89fdT_QaoHOqY4C-f-kwP8aQ"} 
        />
      </div>
    </AblyProvider>
  );
}
