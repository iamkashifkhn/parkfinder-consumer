"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/authService";
import { User } from "@/types/user";
import Image from "next/image";
import Link from "next/link";
import { useSafeToast } from "@/components/SafeToast";

// Common navigation paths to prefetch
const commonPaths = ['/dashboard', '/profile', '/account-settings'];

export function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const hasRedirected = useRef(false);
  const showToast = useSafeToast();

  // Define admin-only routes
  const adminOnlyRoutes = [
    '/admin-dashboard',
    '/users',
    '/registration-requests',
    '/parking-companies'
  ];

  // Check if current path is an admin-only route
  const isAdminOnlyRoute = adminOnlyRoutes.some(route => 
    pathname?.startsWith(route)
  );
  
  // Stable redirect functions
  const redirectToLogin = useCallback(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    router.push('/login');
  }, [router]);
  
  const redirectToHome = useCallback(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    router.push('/');
    showToast({
      title: "Access Denied",
      description: "You don't have permission to access this area.",
      variant: "destructive",
    });
  }, [router, showToast]);
  
  const redirectToDashboard = useCallback(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    router.push('/dashboard');
    showToast({
      title: "Admin Access Required",
      description: "This section is restricted to administrators only.",
      variant: "destructive",
    });
  }, [router, showToast]);

  // Memoized prefetch function for admin routes
  const prefetchAdminRoutes = useCallback(() => {
    if (router && typeof router.prefetch === 'function') {
      router.prefetch('/admin-dashboard');
      router.prefetch('/users');
    }
  }, [router]);

  // Memoized prefetch function for provider routes
  const prefetchProviderRoutes = useCallback(() => {
    if (router && typeof router.prefetch === 'function') {
      router.prefetch('/parking-listings');
    }
  }, [router]);

  // Memoized prefetch function for common routes
  const prefetchCommonRoutes = useCallback(() => {
    if (router && typeof router.prefetch === 'function') {
      commonPaths.forEach(path => {
        router.prefetch(path);
      });
    }
  }, [router]);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      // Redirect to login if not authenticated
      redirectToLogin();
    } else if (currentUser.role !== 'admin' && currentUser.role !== 'provider') {
      // Redirect to homepage if user is not admin or provider
      redirectToHome();
    } else if (isAdminOnlyRoute && currentUser.role !== 'admin') {
      // Redirect to dashboard if provider tries to access admin-only routes
      redirectToDashboard();
    } else {
      setUser(currentUser);
      setIsLoading(false);
      
      // Prefetch common routes for faster navigation
      prefetchCommonRoutes();
      
      // Prefetch role-specific paths
      if (currentUser.role === 'admin') {
        prefetchAdminRoutes();
      } else if (currentUser.role === 'provider') {
        prefetchProviderRoutes();
      }
    }
  }, [isAdminOnlyRoute, redirectToLogin, redirectToHome, redirectToDashboard, prefetchCommonRoutes, prefetchAdminRoutes, prefetchProviderRoutes]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - now responsive */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col w-full">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          {/* Left side - Logo on mobile, sidebar toggle is in Sidebar component */}
          <div className="flex items-center lg:hidden">
            <div className="w-10">
              {/* This empty div creates space for the hamburger menu */}
            </div>
            <Image
              src="/images/logo.svg"
              alt="ParkFinder24"
              width={28}
              height={28}
              className="mr-2"
            />
            <span className="font-semibold text-sm">ParkFinder24</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 lg:gap-4 ml-auto">
            {/* Notifications */}
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button> */}

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.fullName?.split(' ').map((n: string) => n[0]).join('') || 
                       user?.firstName?.[0] || 
                       user?.lastName?.[0] || 
                       'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.fullName || 
                       (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User')}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account-settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  authService.logout();
                  router.push('/login');
                }}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 