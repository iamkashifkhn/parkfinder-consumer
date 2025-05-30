"use client";

import { useEffect, useState } from "react";
import { format, isValid } from "date-fns";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { publicParkingService, ParkingSpace } from "@/services/parkingSpaceService";
import { useBookingStore } from "@/store/bookingStore";
import { CurrencySymbol } from "./CurrencySymbol";

interface Vehicle {
  id: string;
  licensePlate: string;
  makeAndModel: string;
  vehicleType: string;
  numberOfPeople: string;
}

interface BookingSummaryProps {
  parkingId: string;
  startDate?: string;
  endDate?: string;
  selectedServices?: AdditionalService[];
  outboundFlight?: string;
  inboundFlight?: string;
  vehicles?: Vehicle[];
}

interface AdditionalService {
  id: string;
  name: string;
  price: number;
}

export function BookingSummary({ 
  parkingId, 
  startDate, 
  endDate,
  selectedServices = [],
  outboundFlight,
  inboundFlight,
  vehicles = []
}: BookingSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [parkingDetails, setParkingDetails] = useState<ParkingSpace | null>(null);
  const storedAmount = useBookingStore((state) => state.amount);
  const baseParkingAmount = useBookingStore((state) => state.baseParkingAmount);
  const additionalServicesAmount = useBookingStore((state) => state.additionalServicesAmount);
  const vehicleMultiplier = useBookingStore((state) => state.vehicleMultiplier) || 1;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isValid(date) ? format(date, "PPP") : '';
  };

  useEffect(() => {
    const fetchParkingDetails = async () => {
      setLoading(true);
      try {
        const data = await publicParkingService.getPublicParkingSpaceById(parkingId);
        setParkingDetails(data);
      } catch (error) {
        console.error("Error fetching parking details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (parkingId) {
      fetchParkingDetails();
    }
  }, [parkingId]);

  const calculatePrice = () => {
    if (!startDate || !endDate) return null;

    // Use stored amounts from booking store if available
    const baseAmount = baseParkingAmount || 0;
    const servicesAmount = additionalServicesAmount || 0;
    const subtotal = storedAmount || 0;

    // Calculate the base total (before vehicle multiplier)
    const baseTotal = baseAmount + servicesAmount;

    return {
      baseAmount,
      servicesAmount,
      baseTotal,
      vehicleMultiplier,
      subtotal,
      total: subtotal
    };
  };

  const priceDetails = calculatePrice();

  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>

      {parkingDetails && (
        <div className="space-y-4">
          <div>
            <div className="font-medium">{parkingDetails.name}</div>
            {startDate && endDate && (
              <div className="text-sm text-muted-foreground">
                {formatDate(startDate)} - {formatDate(endDate)}
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          {vehicles.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm font-medium">Vehicles ({vehicles.length}):</div>
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="text-sm mt-2">
                  <div className="font-medium">Vehicle {index + 1}:</div>
                  <div className="pl-2 text-muted-foreground">
                    <div>{vehicle.makeAndModel} ({vehicle.vehicleType})</div>
                    <div>License: {vehicle.licensePlate}</div>
                    <div>Passengers: {vehicle.numberOfPeople}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flight Information */}
          {(outboundFlight || inboundFlight) && (
            <div className="space-y-2 pt-4 border-t">
              <div className="text-sm font-medium">Flight Information:</div>
              {outboundFlight && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Outbound:</span> {outboundFlight}
                </div>
              )}
              {inboundFlight && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Inbound:</span> {inboundFlight}
                </div>
              )}
            </div>
          )}

          {priceDetails && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Base parking fee</span>
                <span>
                  <CurrencySymbol size="lg" />
                  {priceDetails.baseAmount.toFixed(2)}
                </span>
              </div>

              {/* Display selected additional services */}
              {selectedServices.length > 0 && (
                <>
                  <div className="text-sm font-medium pt-2">Additional Services:</div>
                  {selectedServices.map(service => (
                    <div key={service.id} className="flex justify-between text-sm pl-2">
                      <span>{service.name}</span>
                      <span>
                        <CurrencySymbol size="lg" />
                        {service.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Show base total before multiplier */}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span>Subtotal (per vehicle)</span>
                <span>
                  <CurrencySymbol size="lg" />
                  {priceDetails.baseTotal.toFixed(2)}
                </span>
              </div>
              
              {/* Show vehicle multiplier */}
              {vehicles.length > 1 && (
                <div className="flex justify-between text-sm pl-2">
                  <span>Vehicle multiplier (×{priceDetails.vehicleMultiplier})</span>
                  <span>
                    <CurrencySymbol size="lg" />
                    {(priceDetails.subtotal - priceDetails.baseTotal).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>
                  <CurrencySymbol size="lg" />
                  {priceDetails.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Free cancellation up to 24 hours before arrival
          </div>
        </div>
      )}
    </Card>
  );
}