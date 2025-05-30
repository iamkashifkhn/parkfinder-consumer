"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppNavigation } from "@/hooks/useAppNavigation";

type Location = {
  id: string;
  name: string;
  image: string;
  parkingSpots: number;
  partneredLots: number;
};

const popularLocations: Location[] = [
  {
    id: "fra",
    name: "Frankfurt",
    image: "/images/frankfurt-airport.jpg",
    parkingSpots: 25,
    partneredLots: 120,
  },
  {
    id: "muc",
    name: "Munich",
    image: "/images/munich-airport.jpg",
    parkingSpots: 18,
    partneredLots: 68,
  },
  {
    id: "ber",
    name: "Berlin",
    image: "/images/berlin-airport.jpg",
    parkingSpots: 15,
    partneredLots: 80,
  },
  {
    id: "ham",
    name: "Hamburg",
    image: "/images/hamburg-airport.jpg",
    parkingSpots: 16,
    partneredLots: 86,
  },
  {
    id: "cgn",
    name: "Cologne",
    image: "/images/cologne-airport.jpg",
    parkingSpots: 39,
    partneredLots: 186,
  },
  {
    id: "dus",
    name: "Düsseldorf",
    image: "/images/dusseldorf-airport.webp",
    parkingSpots: 15,
    partneredLots: 632,
  },
];

export function PopularLocations() {
  const { navigateTo } = useAppNavigation();

  const firstRow = popularLocations.slice(0, 3);
  const secondRow = popularLocations.slice(3, 6);

  const getFlexClass = (rowIndex: number, itemIndex: number) => {
    if (rowIndex === 0) {
      // First row: 0.3 - 0.35 - 0.45
      return itemIndex === 0 ? "flex-[0.3]" : itemIndex === 1 ? "flex-[0.35]" : "flex-[0.45]";
    } else {
      // Second row: 0.45 - 0.35 - 0.3
      return itemIndex === 0 ? "flex-[0.45]" : itemIndex === 1 ? "flex-[0.35]" : "flex-[0.3]";
    }
  };

  const handleLocationClick = (location: string) => {
    navigateTo(`/search?location=${encodeURIComponent(location)}`);
  };

  const renderLocationCard = (location: Location, rowIndex: number, itemIndex: number) => (
    <Link
      key={location.id}
      href={`/search?location=${encodeURIComponent(location.name)}`}
      className={`${getFlexClass(rowIndex, itemIndex)} group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300`}
      onClick={() => handleLocationClick(location.name)}
    >
      <div className="absolute inset-0">
        <Image
          src={location.image}
          alt={location.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="absolute bottom-0 w-full p-4 bg-white">
        <h3 className="text-lg font-semibold mb-2">{location.name}</h3>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{location.parkingSpots} Vacancy</span>
          <span>{location.partneredLots} companies</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      {/* First Row */}
      <div className="flex flex-col md:flex-row gap-6 h-[300px]">
        {firstRow.map((location, index) => renderLocationCard(location, 0, index))}
      </div>

      {/* Second Row */}
      <div className="flex flex-col md:flex-row gap-6 h-[300px]">
        {secondRow.map((location, index) => renderLocationCard(location, 1, index))}
      </div>
    </div>
  );
} 