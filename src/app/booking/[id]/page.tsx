"use client";

import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import { BookingForm } from "@/components/BookingForm";
import { BookingSummary } from "@/components/BookingSummary";
import { BookingSteps } from "@/components/BookingSteps";
import { LoadingSpinner } from "@/components/ui/loading";
import { publicParkingService, ParkingSpace, Feature } from "@/services/parkingSpaceService";

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Define the service interface here to be shared
interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export default function BookingPage({ params, searchParams }: PageProps) {
  // Unwrap params and searchParams using React.use()
  const unwrappedParams = React.use(params as any) as { id: string };
  const unwrappedSearchParams = React.use(searchParams as any) as { [key: string]: string | string[] | undefined };
  
  // Access the unwrapped search params
  const start = unwrappedSearchParams?.start?.toString();
  const end = unwrappedSearchParams?.end?.toString();
  
  // State for selected services and parking data
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [parkingData, setParkingData] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch parking space data
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        const data = await publicParkingService.getPublicParkingSpaceById(unwrappedParams.id);
        if (data) {
          setParkingData(data);
        }
      } catch (err) {
        console.error("Error fetching parking space:", err);
      } finally {
        setLoading(false);
      }
    };

    if (unwrappedParams.id) {
      fetchParkingData();
    }
  }, [unwrappedParams.id]);

  // Convert API features to additional services format
  const additionalServices: AdditionalService[] = parkingData?.features
    .filter(feature => !feature.isFree) // Only include paid features
    .map(feature => ({
      id: feature.id,
      name: feature.name,
      price: parseFloat(feature.price),
      description: undefined
    })) || [];
  
  // Get the full service objects for selected services
  const selectedServices = additionalServices.filter(service => 
    selectedServiceIds.includes(service.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!parkingData) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-red-500">Failed to load parking space details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BookingSteps currentStep={1} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <h1 className="text-3xl font-bold">Complete Your Booking</h1>
              <div className="bg-white rounded-lg shadow-sm">
                <Suspense fallback={<LoadingSpinner />}>
                  <BookingForm
                    parkingId={unwrappedParams.id}
                    startDate={start}
                    endDate={end}
                    additionalServices={additionalServices}
                    selectedServiceIds={selectedServiceIds}
                    onServiceChange={setSelectedServiceIds}
                  />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <BookingSummary
                parkingId={unwrappedParams.id}
                startDate={start}
                endDate={end}
                selectedServices={selectedServices}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 