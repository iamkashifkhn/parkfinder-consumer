"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANDING } from "@/constants/branding";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState(email || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        email,
        otp
      });
      
      toast({
        title: "Email verified!",
        description: "Your email has been successfully verified. You can now log in.",
      });
      router.push("/auth/consumer/login?verified=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        email
      });
      setError("New verification code has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        email: resetEmail
      });
      // Update the URL with new email
      router.push(`/auth/consumer/verify?email=${encodeURIComponent(resetEmail)}`);
      setShowResetForm(false);
      setError("New verification code has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email && !showResetForm) {
    router.push("/auth/consumer/signup");
    return null;
  }

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Image
              src="/images/logo.svg"
              alt={BRANDING.COMPANY_NAME}
              width={140}
              height={36}
              className="h-9 w-auto mx-auto"
              priority
            />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Reset Verification Code
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive a new verification code
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleResetOTP}>
            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes("has been sent") 
                  ? "bg-green-50 text-green-800" 
                  : "bg-red-50 text-red-800"
              }`}>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="resetEmail"
                name="resetEmail"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-11"
              />
            </div>

            <div className="flex flex-col space-y-4">
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
                    Sending...
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => setShowResetForm(false)}
              >
                Back to verification
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/logo.svg"
            alt={BRANDING.COMPANY_NAME}
            width={140}
            height={36}
            className="h-9 w-auto mx-auto"
            priority
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-3 rounded-lg text-sm ${
              error.includes("has been sent") 
                ? "bg-green-50 text-green-800" 
                : "bg-red-50 text-red-800"
            }`}>
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="h-11 text-center text-lg tracking-widest"
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the 6-digit code sent to your email
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-11 text-base shadow-sm"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </Button>
            
            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-gray-500 hover:text-gray-900"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Resend verification code to same email
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-gray-500 hover:text-gray-900"
                onClick={() => setShowResetForm(true)}
                disabled={isLoading}
              >
                Use a different email address
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 