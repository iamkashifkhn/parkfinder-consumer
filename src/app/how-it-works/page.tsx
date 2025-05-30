"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle, Car, Clock, Shield } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Car,
      title: "Find Your Spot",
      description: "Enter your travel dates and compare parking options near your airport."
    },
    {
      icon: CheckCircle,
      title: "Book Securely",
      description: "Choose your preferred parking spot and book instantly with our secure payment system."
    },
    {
      icon: Clock,
      title: "Park & Go",
      description: "Show your booking confirmation at the parking facility and head to your flight."
    },
    {
      icon: Shield,
      title: "Peace of Mind",
      description: "Enjoy your trip knowing your car is safe with our verified parking partners."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-4xl font-bold text-center mb-12">How Smart Parking Works</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <Card key={index} className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 