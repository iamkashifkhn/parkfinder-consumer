"use client";

import { SearchResults } from "@/components/SearchResults";
import { SearchFormInline } from "@/components/SearchFormInline";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  
  const location = searchParams?.get("location") || "";
  const start = searchParams?.get("start") ? new Date(searchParams.get("start")!) : undefined;
  const end = searchParams?.get("end") ? new Date(searchParams.get("end")!) : undefined;
  const airportLat = searchParams?.get("airportLat");
  const airportLng = searchParams?.get("airportLng");

  const getTimeFromISOString = (dateStr?: string | null) => {
    if (!dateStr) return "12:00";
    const date = new Date(dateStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Add SearchForm Section */}
      <div className="bg-blue-600 py-4">
        <div className="max-w-7xl mx-auto px-4 bg-white rounded-lg p-5">
          <div className="w-full">
            <SearchFormInline 
              defaultLocation={location}
              defaultStartDate={start}
              defaultEndDate={end}
              defaultStartTime={getTimeFromISOString(searchParams?.get("start"))}
              defaultEndTime={getTimeFromISOString(searchParams?.get("end"))}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Results */}
          <div className="lg:col-span-12">
            <SearchResults 
              location={location} 
              airportLat={airportLat ? parseFloat(airportLat) : undefined}
              airportLng={airportLng ? parseFloat(airportLng) : undefined}
            />
          </div>

          {/* Map */}
          {/* <div className="lg:col-span-4">
            <div className="sticky top-20">
              <SearchMap />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
} 