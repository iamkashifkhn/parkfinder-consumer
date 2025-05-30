"use client";

import React from "react";
import { PaymentForm } from "@/components/PaymentForm";
import { BookingSummary } from "@/components/BookingSummary";
import { BookingSteps } from "@/components/BookingSteps";
import { useBookingStore } from "@/store/bookingStore";

export default function PaymentPage({
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

  // Get booking details from the store
  const bookingDetails = useBookingStore();

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BookingSteps currentStep={2} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <PaymentForm
              parkingId={unwrappedParams.id}
              startDate={unwrappedSearchParams.start}
              endDate={unwrappedSearchParams.end}
              services={unwrappedSearchParams.services}
              outboundFlight={unwrappedSearchParams.outbound}
              inboundFlight={unwrappedSearchParams.inbound}
              vehicles={unwrappedSearchParams.vehicles}
            />
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <BookingSummary
                parkingId={unwrappedParams.id}
                startDate={unwrappedSearchParams.start}
                endDate={unwrappedSearchParams.end}
                selectedServices={bookingDetails.additionalServices}
                outboundFlight={bookingDetails.outboundFlight}
                inboundFlight={bookingDetails.inboundFlight}
                vehicles={bookingDetails.vehicles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 