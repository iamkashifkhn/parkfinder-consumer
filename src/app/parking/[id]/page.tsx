"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { ParkingDetails } from "@/components/ParkingDetails"
import { ParkingBookingCard } from "@/components/ParkingBookingCard"
import { ParkingReviews } from "@/components/ParkingReviews"
import { ParkingLocation } from "@/components/ParkingLocation"
import { LoadingSpinner } from "@/components/ui/loading"
import { notFound, useSearchParams } from "next/navigation"

async function getParkingData(id: string) {
  if (!id) {
    notFound()
  }
  return id
}

export default function ParkingDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as any) as { id: string };
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [parkingId, setParkingId] = useState<string>('');

  useEffect(() => {
    if (!unwrappedParams?.id) return;
    
    const init = async () => {
      try {
        const resolvedId = await getParkingData(unwrappedParams.id as string);
        setParkingId(resolvedId);

        if (searchParams) {
          const start = searchParams.get('start');
          const end = searchParams.get('end');
          
          setStartDate(start ? new Date(start) : undefined);
          setEndDate(end ? new Date(end) : undefined);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
      }
    };

    init();
  }, [unwrappedParams?.id, searchParams]);

  if (!parkingId) return <LoadingSpinner />;

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <ParkingDetails id={parkingId} />
            </Suspense>

            {/* Location Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Location & Directions</h2>
              <Suspense fallback={<LoadingSpinner />}>
                <ParkingLocation id={parkingId} />
              </Suspense>
            </section>

            {/* Reviews Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
              <Suspense fallback={<LoadingSpinner />}>
                <ParkingReviews id={parkingId} />
              </Suspense>
            </section>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Suspense fallback={<LoadingSpinner />}>
                <ParkingBookingCard 
                  id={parkingId}
                  startDate={startDate}
                  endDate={endDate}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

