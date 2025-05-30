import React from "react";
import { Suspense } from "react";
import BookingDetailsClient from "@/app/bookings/[id]/BookingDetailsClient";

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <BookingDetailsClient bookingId={resolvedParams.id} />
    </Suspense>
  );
} 