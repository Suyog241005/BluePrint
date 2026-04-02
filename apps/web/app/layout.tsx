import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import { TRPCProvider } from "@/components/trpc-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@workspace/ui/components/sonner";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const cookies = headerList.get("cookie") ?? undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("light antialiased", fontMono.variable, fontSans.variable)}
      style={{ colorScheme: "light", height: "100%", width: "100%" }}
    >
      <body className="h-full w-full bg-slate-50/50 font-sans antialiased">
        <TRPCProvider cookies={cookies}>
          <TooltipProvider delayDuration={0}>
            <div className="flex h-full flex-col">
              <Navbar />
              <main className="h-full flex-1">{children}</main>
            </div>
          </TooltipProvider>
          <Toaster />
        </TRPCProvider>
      </body>
    </html>
  );
}
