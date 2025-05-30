"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-24">
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-600">Registration Submitted Successfully!</h1>
          
          <p className="text-lg text-muted-foreground max-w-md">
            Thank you for your interest in partnering with ParkFinder24. Our team will review your application and contact you soon.
          </p>

          <div className="border-t border-border w-full my-6 pt-6">
            <p className="text-sm text-muted-foreground mb-6">
              What would you like to do next?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => router.push("/business")}
              >
                Return to Business Page
              </Button>
              
              <Button 
                onClick={() => router.push("/")}
              >
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 