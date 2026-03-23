import { Geist, Geist_Mono } from "next/font/google"
import "@workspace/ui/globals.css"
import { TRPCProvider } from "@/components/trpc-provider"
import { Navbar } from "@/components/navbar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased light", fontMono.variable, fontSans.variable)}
      style={{ colorScheme: 'light' }}
    >
      <body className="font-sans antialiased bg-slate-50/50">
        <TRPCProvider>
          <TooltipProvider delayDuration={0}>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </TooltipProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
