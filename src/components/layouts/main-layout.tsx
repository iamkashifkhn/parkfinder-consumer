"use client";

import { useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useSafeToast } from "@/components/SafeToast";

export function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const showToast = useSafeToast();
  
  // Check if the current path is a protected route
  const isProtectedRoute = pathname?.startsWith("/(protected)") || 
    pathname?.startsWith("/dashboard") || 
    pathname?.startsWith("/admin-dashboard") ||
    pathname?.startsWith("/parking-listing") ||
    pathname?.startsWith("/parking-listings") ||
    pathname?.startsWith("/parking-tier") ||
    pathname?.startsWith("/parking-booking-history") ||
    pathname?.startsWith("/manage-features") ||
    pathname?.startsWith("/registration-requests") ||
    pathname?.startsWith("/company-onboarding") ||
    pathname?.startsWith("/parking-companies") ||
    pathname?.startsWith("/users") ||
    pathname?.startsWith("/support-requests") ||
    pathname?.startsWith("/dynamic-pricing") ||
    pathname?.startsWith("/refund-management") ||
    pathname?.startsWith("/account-settings") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/airports") ||
    pathname?.startsWith("/payments") ||
    pathname?.startsWith("/admin-payments");
  
  // Check if the current path is an auth route
  const isAuthRoute = pathname?.includes("/auth/") || 
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";
    
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

  // Check user role for protected routes
  useEffect(() => {
    if (isProtectedRoute && !hasRedirected.current) {
      const currentUser = authService.getCurrentUser();
      
      // If no user is logged in, redirect to login
      if (!currentUser) {
        redirectToLogin();
        return;
      }
      
      // If user is a consumer, they shouldn't access protected routes
      if (currentUser.role === 'consumer') {
        redirectToHome();
        return;
      }
    }
  }, [isProtectedRoute, redirectToLogin, redirectToHome]);

  // If it's a protected or auth route, don't add the header and footer
  if (isProtectedRoute || isAuthRoute) {
    return children;
  }

  // For public routes, add the header and footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
} 