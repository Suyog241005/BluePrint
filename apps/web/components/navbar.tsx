"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { authClient } from "@workspace/better-auth/client"
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { LogOut, LayoutDashboard, Settings, User } from "lucide-react"

export function Navbar() {
  const { data: session } = authClient.useSession()
  const pathname = usePathname()

  // Don't show regular navbar on the editor page to maximize space
  const isEditor = pathname.startsWith("/whiteboard/")

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <span className="text-white font-black text-xl italic">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight">BluePrint</span>
          </Link>

          {!isEditor && (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant={pathname === "/" ? "secondary" : "ghost"} size="sm" className="font-medium">
                   Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-slate-200">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                      {session.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="p-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => authClient.signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Link href="/">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/10">
                   Sign In
                </Button>
             </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
