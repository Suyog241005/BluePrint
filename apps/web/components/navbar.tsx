"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@workspace/better-auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { LogOut, LayoutDashboard, Settings, User } from "lucide-react";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  // Don't show regular navbar on the editor page to maximize space
  const isEditor = pathname.startsWith("/whiteboard/");

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-black text-white italic">B</span>
            </div>
            <span className="text-xl font-bold tracking-tight">BluePrint</span>
          </Link>

          {!isEditor && (
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/">
                <Button
                  variant={pathname === "/" ? "secondary" : "ghost"}
                  size="sm"
                  className="font-medium"
                >
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
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full border border-slate-200"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name}
                    />
                    <AvatarFallback className="bg-blue-50 font-bold text-blue-600">
                      {session.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="mt-2 w-56 rounded-xl shadow-xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="p-3 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-bold">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer p-3">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer p-3">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer p-3 text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={() => authClient.signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/">
              <Button
                size="sm"
                className="rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/10 hover:bg-blue-700"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
