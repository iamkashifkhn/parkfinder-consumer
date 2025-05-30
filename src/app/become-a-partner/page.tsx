"use client";

import { Card } from "@/components/ui/card";
import { Handshake, TrendingUp, Layers, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function BecomeAPartnerPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Become a Partner</h1>
        <p className="text-xl text-muted-foreground">
          Join our network of premium parking providers and grow your business
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Increase Revenue</h3>
                <p className="text-muted-foreground">
                  Gain access to thousands of potential customers actively searching for parking solutions.
                  Our platform brings you bookings without the need for additional marketing expenses.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <Layers className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Simple Integration</h3>
                <p className="text-muted-foreground">
                  Our technology easily integrates with your existing systems. You can manage your listings, 
                  availability, and pricing through our easy-to-use partner dashboard.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <BarChart className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
                <p className="text-muted-foreground">
                  Gain insights into booking patterns, customer preferences, and revenue trends 
                  to optimize your parking business operations.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-4">
              <Handshake className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
                <p className="text-muted-foreground">
                  Our partner success team will guide you through the onboarding process and 
                  provide ongoing support to help your business thrive.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-center">How to Join</h3>
          <ol className="space-y-4 mb-6">
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">1</span>
              <p className="text-muted-foreground">Complete our partner application form with details about your parking facility</p>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">2</span>
              <p className="text-muted-foreground">Our team will review your application and contact you for verification</p>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">3</span>
              <p className="text-muted-foreground">Set up your partner dashboard and configure your listing details</p>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">4</span>
              <p className="text-muted-foreground">Start receiving bookings and grow your business with ParkFinder24</p>
            </li>
          </ol>
          <div className="flex justify-center mt-8">
            <Button className="px-8" onClick={() => router.push('/business/register')}>Apply Now</Button>
          </div>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          Want to learn more? Contact our partner team at partners@parkfinder24.com
        </p>
      </div>
    </div>
  );
} 