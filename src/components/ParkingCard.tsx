"use client";

import Image from "next/image";
import { Star, Clock, Car } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CurrencySymbol } from "./CurrencySymbol";



interface ParkingCardProps {
  parking: {
    id: string;
    name: string;
    image: string;
    price: number;
    distanceKm: number;
    features: string[];
    parkingType: "Covered" | "Outdoor" | "Both";
    rating: number;
    reviewCount: number;
    shuttle: {
      available: boolean;
      frequency: string;
      duration: string;
    };
  };
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

export function ParkingCard({ parking, startDate, endDate, startTime = "12:00", endTime = "12:00" }: ParkingCardProps) {
  console.log(parking, "parking");
  const router = useRouter();



  const handleViewDetails = async () => {
    if (!parking.id) {
      console.error("Parking ID is missing");
      return;
    }

    try {
      // Create datetime strings in local timezone (without Z suffix)
      const startDateTime = startDate ? `${startDate} ${startTime}` : undefined;
      const endDateTime = endDate ? `${endDate} ${endTime}` : undefined;

      const params = new URLSearchParams();
      if (startDateTime) params.set('start', startDateTime);
      if (endDateTime) params.set('end', endDateTime);

      const url = `/parking/${parking.id}${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Use replace and await the navigation
      await router.replace(url);
      // Force a page refresh to ensure clean state
      window.location.href = url;
    } catch (error) {
      console.error("Error navigating:", error);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-72 h-48">
          <Image
            src={parking.image}
            alt={parking.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            style={{ objectFit: "cover" }}
            loading="eager"
            unoptimized
            blurDataURL={parking.image}
          />
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2">{parking.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">
                    {isNaN(parking.rating) ? "New" : parking.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  ({parking.reviewCount || 0} {parking.reviewCount === 1 ? "review" : "reviews"})
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {parking.distanceKm.toFixed(2)} km to airport
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold flex items-center justify-end gap-0.5">
                <CurrencySymbol size="lg" />
                {parking.price}
              </div>
              <div className="text-sm text-muted-foreground">per day</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {parking.features.map((feature) => (
                <Badge key={feature} variant="secondary">
                  <Car className="w-3 h-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>

            {parking.shuttle.available && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Shuttle every {parking.shuttle.frequency} • {parking.shuttle.duration} to terminal
                </span>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button 
                onClick={handleViewDetails}
                className="w-full md:w-auto"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 