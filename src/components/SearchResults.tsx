"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ParkingCard } from "@/components/ParkingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isValid, parseISO } from "date-fns";
import { SearchFilters } from "@/components/SearchFilters";
import { Card } from "./ui/card";
import { publicParkingService, ParkingSpace } from "@/services/parkingSpaceService";
// import { Button } from "./ui/button";

type ParkingSpot = {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
  distanceKm: number;
  features: string[];
  parkingType: "Covered" | "Outdoor" | "Both";
  shuttle: {
    available: boolean;
    frequency: string;
    duration: string;
  };
  
};

interface SearchResultsProps {
  location?: string;
  airportLat?: number;
  airportLng?: number;
}

export function SearchResults({ location, airportLat, airportLng }: SearchResultsProps) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ParkingSpot[]>([]);
  const [filteredResults, setFilteredResults] = useState<ParkingSpot[]>([]);
  const searchParams = useSearchParams();

  // Parse the dates and times from URL
  const startParam = searchParams ? searchParams.get('start') : null;
  const endParam = searchParams ? searchParams.get('end') : null;

  // Parse the ISO date strings and extract time
  const parseDateTime = (dateTimeStr?: string | null) => {
    if (!dateTimeStr) return { date: '', time: '' };
    try {
      const date = new Date(dateTimeStr);
      if (!isValid(date)) return { date: '', time: '' };
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'HH:mm')
      };
    } catch {
      return { date: '', time: '' };
    }
  };

  const { date: parsedStartDate, time: startTime } = parseDateTime(startParam);
  const { date: parsedEndDate, time: endTime } = parseDateTime(endParam);

  const formatDisplayDate = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? `${format(date, 'MMM dd, yyyy')} at ${timeStr}` : '';
    } catch {
      return '';
    }
  };

  const formattedStartDate = formatDisplayDate(parsedStartDate, startTime);
  const formattedEndDate = formatDisplayDate(parsedEndDate, endTime);

  // Map API parking space to the ParkingSpot format expected by ParkingCard
  const mapApiDataToParkingSpots = (data: ParkingSpace[]): ParkingSpot[] => {
    if (!Array.isArray(data)) {
      console.error('Expected array of parking spaces, got:', data);
      return [];
    }

    return data.map(space => {
      const featureNames = space.features.map(feature => feature.name);
      
      // Set a default parking type
      let parkingType: "Covered" | "Outdoor" | "Both" = "Outdoor";
      
      // Try to detect parking type from name, description or features
      if (space.name.toLowerCase().includes("covered") || 
          space.description.toLowerCase().includes("covered") ||
          featureNames.some(f => f.toLowerCase().includes("covered"))) {
        parkingType = "Covered";
      }
      
      return {
        id: space.id,
        name: space.name,
        image: space.images.length > 0 ? space.images[0] : "/images/placeholder-parking.jpg",
        rating: space.reviews.reduce((sum, review) => sum + review.rating, 0) / space.reviews.length,
        reviewCount: space.reviews.length,
        price: parseFloat(space.parkingTier.pricePerDay) || 0,
        distanceKm: space.distanceKm ?? 0, // Use nullish coalescing to provide default value
        features: featureNames,
        parkingType: parkingType,
        shuttle: {
          available: false,
          frequency: "",
          duration: ""
        },
        reviews: space.reviews.map(review => ({
          id: review.id,
          rating: review.rating
        }))
      };
    });
  };

  useEffect(() => {
    // Fetch data from the API
    setLoading(true);
    
    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Prepare search parameters
    const searchQueryParams = {
      airportLat: airportLat,
      airportLng: airportLng,
      maxDistanceKm: 20,
      timezone: userTimezone // Add timezone parameter
    };
    
    publicParkingService.getAllPublicParkingSpaces(searchQueryParams)
      .then(response => {
        console.log('API Response:', response);
        const mappedData = mapApiDataToParkingSpots(response);
        console.log('Mapped data:', mappedData);
        setResults(mappedData);
        setFilteredResults(mappedData);
      })
      .catch(error => {
        console.error("Error fetching parking spaces:", error);
        setResults([]);
        setFilteredResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [airportLat, airportLng]);



  const handleFiltersChange = (filters: {
    priceRange: number[];
    distance: number[];
    parkingTypes: string[];
    features: string[];
  }) => {
    let filtered = [...results];

    // Apply filters immediately when they change
    if (filters.parkingTypes.length > 0) {
      filtered = filtered.filter(spot => {
        if (spot.parkingType === "Both") {
          return filters.parkingTypes.includes("Covered") || 
                 filters.parkingTypes.includes("Outdoor") ||
                 filters.parkingTypes.includes("Both");
        }
        return filters.parkingTypes.includes(spot.parkingType);
      });
    }

    if (filters.features.length > 0) {
      filtered = filtered.filter(spot =>
        filters.features.every(feature => {
          const spotFeatures = spot.features.map(f => f.toLowerCase());
          
          switch (feature) {
            case "24/7 Security": 
              return spotFeatures.some(f => f.includes("security") || f.includes("24/7"));
            case "CCTV": 
              return spotFeatures.some(f => f.includes("cctv") || f.includes("camera"));
            case "EV Charging": 
              return spotFeatures.some(f => f.includes("ev") || f.includes("charging"));
            case "Car Wash": 
              return spotFeatures.some(f => f.includes("car wash"));
            case "Shuttle Service": 
              return spot.shuttle.available;
            default: 
              return false;
          }
        })
      );
    }

    // Apply range filters
    filtered = filtered.filter(spot => 
      spot.price >= filters.priceRange[0] && 
      spot.price <= filters.priceRange[1] &&
      spot.distanceKm >= filters.distance[0] && 
      spot.distanceKm <= filters.distance[1]
    );

    setFilteredResults(filtered);
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div>
        <SearchFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Results Section */}
      <div className="md:col-span-3">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {filteredResults.length} parking spots found 
              {location && ` near ${location}`}
              {(formattedStartDate || formattedEndDate) && (
                <span className="text-base font-normal text-muted-foreground ml-2">
                  {formattedStartDate && `from ${formattedStartDate}`}
                  {formattedEndDate && ` to ${formattedEndDate}`}
                </span>
              )}
            </h2>
            {filteredResults.map((spot) => (
              <Card key={spot.id} className="overflow-hidden">
                <ParkingCard 
                  parking={spot}
                  startDate={parsedStartDate}
                  endDate={parsedEndDate}
                  startTime={startTime}
                  endTime={endTime}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 