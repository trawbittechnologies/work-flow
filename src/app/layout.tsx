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
    default: "Flowdesk — Plan. Assign. Finish.",
    template: "%s | Flowdesk",
  },
  description:
    "A premium collaborative project management platform for small teams. Plan projects, assign tasks, track progress, and communicate — all in one place.",
  keywords: ["project management", "tasks", "team collaboration", "kanban", "productivity"],
  authors: [{ name: "Flowdesk" }],
  openGraph: {
    title: "Flowdesk — Plan. Assign. Finish.",
    description: "Premium project management for small teams.",
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
