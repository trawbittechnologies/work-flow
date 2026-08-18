import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trawbit FlowDesk",
    template: "%s | Trawbit FlowDesk",
  },
  description:
    "Trawbit FlowDesk — Modern collaborative project management platform for high-performance teams.",
  keywords: ["project management", "tasks", "team collaboration", "kanban", "productivity", "trawbit", "flowdesk"],
  authors: [{ name: "Trawbit FlowDesk" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Trawbit FlowDesk",
    description: "Modern project management for high-performance teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased text-primary bg-background selection:bg-primary-subtle selection:text-text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
