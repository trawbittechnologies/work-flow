import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { ForceLogout } from "@/components/auth/ForceLogout";
import { NotificationManager } from "@/components/notifications/NotificationManager";
import { AblyProvider } from "@/components/chat/AblyProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, avatar: true },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, read: false },
    }),
  ]);

  if (!user) return <ForceLogout />;

  return (
    <AblyProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar user={user} unreadNotifications={unreadCount} />
        <Header user={user} unreadNotifications={unreadCount} />
        <main
          className="md:ml-[240px] pt-[56px] pb-16 md:pb-0 min-h-screen"
          id="main-content"
        >
          <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
        <MobileNav unreadNotifications={unreadCount} />
        <NotificationManager 
          userId={user.id} 
          vapidPublicKey={process.env.VAPID_PUBLIC_KEY || ""} 
        />
      </div>
    </AblyProvider>
  );
}
