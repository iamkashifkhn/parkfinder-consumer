"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authService";
import { BRANDING } from "@/constants/branding";
import { toast } from "@/components/ui/use-toast";

export default function ConsumerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!searchParams) return;
    
    if (searchParams.get("verified") === "true") {
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified. You can now log in.",
      });
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.delete("verified");
      router.replace(`/auth/consumer/login${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const user = await authService.login(email, password, 'consumer');
        if (!user.isEmailVerified) {
          // Redirect to email verification page with email parameter
          router.push(`/auth/consumer/verify?email=${encodeURIComponent(email)}`);
          return;
        }
      
      // Check if there's a return URL
      const returnUrl = searchParams?.get('returnUrl');
      if (returnUrl) {
        // If there's a return URL, redirect to it
        router.push(decodeURIComponent(returnUrl));
      } else {
        // Otherwise, redirect to home page
        router.push("/");
      }
      router.refresh();
    } catch (err) {
      console.log(err);
      if (err instanceof Error && err.message === "Email not verified") {
        // ✅ Use `email` from earlier
        router.push(`/auth/consumer/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Blue gradient with branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-b from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative w-full flex flex-col items-center justify-center px-12 text-white">
          <div className="mb-8">
            <Image
              src="/images/logo.svg"
              alt={BRANDING.COMPANY_NAME}
              width={180}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-6 text-center">
            Welcome to {BRANDING.COMPANY_NAME}
          </h1>
          <p className="text-xl text-blue-100 text-center max-w-md">
            Find and book the perfect parking spot for your next destination
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Thousands of parking locations</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Easy booking process</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden mb-8">
              <Image
                src="/images/logo.svg"
                alt={BRANDING.COMPANY_NAME}
                width={140}
                height={36}
                className="h-9 w-auto mx-auto"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Or{" "}
              <Link href="/auth/consumer/signup" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  className="h-11"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link 
                  href="/auth/consumer/forgot-password" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 