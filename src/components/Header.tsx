"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import type { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { BRANDING } from "@/constants/branding";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load user from localStorage on component mount
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.push("/");
    setCurrentUser(null);
  };

  return (
    <header className="fixed w-full bg-white z-50 shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
          <span className="sr-only">{BRANDING.COMPANY_NAME}</span>
          <Image
            className="h-8 w-auto"
            src="/images/logo.svg"
            alt={BRANDING.COMPANY_NAME}
            width={120}
            height={32}
            priority
          />
          <span className="text-lg font-semibold text-gray-900">{BRANDING.COMPANY_NAME}</span>
        </Link>

        <div className="flex items-center gap-4">
          {mounted && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser.fullName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/support-requests" className="cursor-pointer">Contact Support</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
} 