"use client";

import React, { useState, useEffect } from "react";
import { BookingConfirmation } from "@/components/BookingConfirmation";
import { BookingSteps } from "@/components/BookingSteps";

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  makeAndModel: string;
  vehicleType: string;
  numberOfPeople: string;
}

export default function ConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { 
    start?: string; 
    end?: string; 
    services?: string; 
    outbound?: string; 
    inbound?: string;
    vehicles?: string;
  };
}) {
  // Unwrap params and searchParams using React.use()
  const unwrappedParams = React.use(params as any) as { id: string };
  const unwrappedSearchParams = React.use(searchParams as any) as { 
    start?: string; 
    end?: string;
    services?: string;
    outbound?: string;
    inbound?: string;
    vehicles?: string;
  };
  
  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BookingSteps currentStep={3} />
        
        <div className="mt-8">
          <BookingConfirmation
            parkingId={unwrappedParams.id}
            startDate={unwrappedSearchParams.start}
            endDate={unwrappedSearchParams.end}
            services={unwrappedSearchParams.services}
            outboundFlight={unwrappedSearchParams.outbound}
            inboundFlight={unwrappedSearchParams.inbound}
            vehicles={unwrappedSearchParams.vehicles}
          />
        </div>
      </div>
    </div>
  );
} 