"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, TrendingUp, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
// import { LoadingButton } from "@/components/ui/loading-button";
// import { useState } from "react";
// import { toast } from "sonner";

export default function BusinessPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Partner with ParkFinder24</h1>
        <p className="text-xl text-muted-foreground">
          Join our network of parking providers and grow your business with ParkFinder24.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">List Your Facility</h3>
              <p className="text-muted-foreground">
                Reach millions of travelers looking for convenient airport parking.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
              <p className="text-muted-foreground">
                Easy-to-use dashboard to manage your bookings and availability.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Grow Revenue</h3>
              <p className="text-muted-foreground">
                Increase occupancy and maximize your parking space revenue.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-muted-foreground">
                Reliable booking system with secure payment processing.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" onClick={() => router.push("/business/register")}>Become a Partner</Button>
      </div>
    </div>
  );
}