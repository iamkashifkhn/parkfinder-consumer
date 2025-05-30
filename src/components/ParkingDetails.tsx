"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, Car, Star, MapPin, Building, Currency } from "lucide-react";
import { publicParkingService, ParkingSpace, Feature } from "@/services/parkingSpaceService";
import { LoadingSpinner } from "@/components/ui/loading";
import { CurrencySymbol } from "./CurrencySymbol";

interface ParkingDetailsProps {
  id: string;
}

export const ParkingDetails = ({ id }: ParkingDetailsProps) => {
  const [parkingData, setParkingData] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        const data = await publicParkingService.getPublicParkingSpaceById(id);
        if (data) {
          setParkingData(data);
        } else {
          setError("Parking space not found");
        }
      } catch (err) {
        console.error("Error fetching parking details:", err);
        setError("Failed to load parking details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchParkingData();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !parkingData) {
    return <div className="p-4 text-red-500">{error || "Failed to load parking details"}</div>;
  }

  // Default instructions - could be fetched from API in the future
  const instructions = {
    arrival: [
      "Drive to the parking facility",
      "Follow signs to designated parking area",
      "Park your car in any available spot",
      "Keep your parking ticket with you",
    ],
    departure: [
      "Return to the parking location",
      "Pay at the payment machine or online",
      "Use the paid ticket to exit",
    ],
  };

  return (
    <div className="space-y-6">
      {/* Title, Rating and Description */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">{parkingData.name}</h1>
          {/* Rating can be added when available in API */}
        </div>
        <p className="text-muted-foreground">{parkingData.description}</p>
      </div>

      {/* Image Gallery */}
      <div className="relative h-96 rounded-lg overflow-hidden">
        {parkingData.images && parkingData.images.length > 0 ? (
          <Image
            src={parkingData.images[0]}
            alt={parkingData.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p>No image available</p>
          </div>
        )}
      </div>

      {/* Location Information */}
      <div className="bg-primary/5 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Address</div>
              <div className="text-sm text-muted-foreground">
                {parkingData.address}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">City</div>
              <div className="text-sm text-muted-foreground">
                {parkingData.city}, {parkingData.state}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Currency className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Price per Day</div>
              <div className="text-sm text-muted-foreground">
              <CurrencySymbol size="lg" />
                {parkingData.parkingTier?.pricePerDay || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parking Information */}
      <div className="bg-primary/5 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Parking Type</div>
              <div className="text-sm text-muted-foreground">
                {parkingData.parkingTier?.name || "Standard"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Available Slots</div>
              <div className="text-sm text-muted-foreground">
                {parkingData.availableSlots} / {parkingData.totalSlots}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Provider</div>
              <div className="text-sm text-muted-foreground">
                {parkingData.provider?.companyName || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      {parkingData.features && parkingData.features.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Features & Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {parkingData.features.map((feature: Feature) => (
              <Badge key={feature.id} variant="secondary">
                {feature.name} {!feature.isFree && feature.price ? `($${feature.price})` : ''}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <Tabs defaultValue="arrival">
        <TabsList>
          <TabsTrigger value="arrival">Arrival Instructions</TabsTrigger>
          <TabsTrigger value="departure">Departure Instructions</TabsTrigger>
        </TabsList>
        <TabsContent value="arrival">
          <div className="space-y-4 p-4">
            {instructions.arrival.map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                </div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="departure">
          <div className="space-y-4 p-4">
            {instructions.departure.map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                </div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 