"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { publicParkingService, ParkingSpace } from "@/services/parkingSpaceService";
import { LoadingSpinner } from "@/components/ui/loading";

interface ParkingLocationProps {
  id: string;
}

export function ParkingLocation({ id }: ParkingLocationProps) {
  const [parkingData, setParkingData] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        const data = await publicParkingService.getPublicParkingSpaceById(id);
        if (data) {
          setParkingData(data);
        }
      } catch (err) {
        console.error("Error fetching parking location:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchParkingData();
    }
  }, [id]);

  if (loading) {
    return (
      <Card className="p-4">
        <LoadingSpinner />
      </Card>
    );
  }

  if (!parkingData || !parkingData.latitude || !parkingData.longitude) {
    return (
      <Card className="p-4">
        <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
          <p>Location data not available</p>
        </div>
      </Card>
    );
  }

  // Use Google Maps embed
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${parkingData.latitude},${parkingData.longitude}&zoom=15`;

  // Alternative: use provided Google Maps URL if available
  const directionsUrl = parkingData.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${parkingData.latitude},${parkingData.longitude}`;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="h-[300px] bg-muted rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
            title="Parking Location Map"
          ></iframe>
        </div>
        <div className="text-sm">
          <p className="font-medium">Address:</p>
          <p className="text-muted-foreground">{parkingData.address}</p>
          <p className="text-muted-foreground">
            {parkingData.city}, {parkingData.state}, {parkingData.country}
          </p>
          <div className="mt-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
} 