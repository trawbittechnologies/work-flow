import type { Metadata } from "next";
import { Inter, Oswald, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased text-[#071A49] bg-background selection:bg-[#B7D600] selection:text-[#071A49]">
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
