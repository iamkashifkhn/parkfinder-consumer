"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Input } from "./ui/input"; 
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "./ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingButton } from "./ui/loading-button";
import { searchAirports, type Airport } from "@/services/airportService";

// Move time options generation outside component
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});


interface SearchFormProps {
  defaultLocation?: string;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
}

export function SearchForm({ 
  defaultLocation = '', 
  defaultStartDate,
  defaultEndDate 
}: SearchFormProps) {
  const router = useRouter();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [searchValue, setSearchValue] = useState(defaultLocation);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultEndDate);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [errors, setErrors] = useState<{
    location?: string;
    startDate?: string;
    endDate?: string;
    dates?: string;
  }>({});

  // Fetch airports on component mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await searchAirports('');
        setAirports(response.data);
      } catch (error) {
        console.error('Error fetching airports:', error);
      }
    };
    fetchAirports();
  }, []);

  // Filter airports based on search value
  const filteredAirports = useMemo(() => {
    if (!searchValue.trim()) return airports;
    
    const searchLower = searchValue.toLowerCase();
    return airports.filter(airport => 
      airport.name.toLowerCase().includes(searchLower) ||
      (airport.city && airport.city.toLowerCase().includes(searchLower)) ||
      airport.countryName.toLowerCase().includes(searchLower)
    );
  }, [airports, searchValue]);

  const handleLocationSelect = useCallback((airport: Airport) => {
    setSelectedLocation(airport.name);
    setSearchValue(airport.name);
    setSelectedAirport(airport);
    setIsLocationOpen(false);
    setIsStartCalendarOpen(true);
  }, []);

  const handleLocationKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsLocationOpen(true);
    }
  }, []);

  const handleStartDateSelect = useCallback((date: Date | undefined) => {
    setStartDate(date);
    setIsStartCalendarOpen(false);
    if (date) {
      setIsStartTimeOpen(true);
      // If end date is invalid relative to new start date, reset it
      if (endDate && isBefore(endDate, date)) {
        setEndDate(undefined);
      }
    }
  }, [endDate]);

  const handleStartTimeSelect = useCallback((time: string) => {
    setStartTime(time);
    setIsStartTimeOpen(false);
    // Add a small delay to ensure the end calendar opens after the time popover closes
    setTimeout(() => {
      setIsEndCalendarOpen(true);
    }, 10);
  }, []);

  const handleEndDateSelect = useCallback((date: Date | undefined) => {
    setEndDate(date);
    setIsEndCalendarOpen(false);
    if (date) {
      setIsEndTimeOpen(true);
    }
  }, []);

  const handleEndTimeSelect = useCallback((time: string) => {
    setEndTime(time);
    setIsEndTimeOpen(false);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!selectedLocation) {
      newErrors.location = "Please select a location";
    }

    if (!startDate) {
      newErrors.startDate = "Please select a start date";
    } else if (isBefore(startDate, today)) {
      newErrors.startDate = "Start date cannot be in the past";
    }

    if (!endDate) {
      newErrors.endDate = "Please select an end date";
    }

    if (startDate && endDate) {
      if (isBefore(endDate, startDate)) {
        newErrors.dates = "End date must be after start date";
      }
      
      const maxDate = addDays(startDate, 30);
      if (isAfter(endDate, maxDate)) {
        newErrors.dates = "Maximum booking duration is 30 days";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm() || !startDate || !endDate || !selectedAirport) {
      return;
    }

    setIsLoading(true);
    try {
      const startDateTime = new Date(startDate.getTime());
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(endDate.getTime());
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes);

      // Format dates in local format (YYYY-MM-DD HH:MM)
      const formatLocalDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      };

      const searchParams = new URLSearchParams({
        location: selectedLocation,
        start: formatLocalDateTime(startDateTime),
        end: formatLocalDateTime(endDateTime),
        airportLat: selectedAirport.latitude.toString(),
        airportLng: selectedAirport.longitude.toString()
      });

      await router.push(`/search?${searchParams.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to check if form is complete
  const isFormComplete = useMemo(() => {
    return Boolean(
      selectedLocation &&
      startDate &&
      endDate &&
      startTime &&
      endTime &&
      selectedAirport
    );
  }, [selectedLocation, startDate, endDate, startTime, endTime, selectedAirport]);

  // Calculate min and max dates for each calendar
  const minStartDate = today;
  const minEndDate = startDate ? startDate : today;
  const maxEndDate = startDate ? addDays(startDate, 30) : addDays(today, 30);

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg shadow-lg p-6 gap-4 flex flex-col">
      {/* Location Input */}
      <div className="space-y-2">
        <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
          <PopoverTrigger asChild>
            <Input
              type="text"
              placeholder="Search airport"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
              onKeyDown={handleLocationKeyDown}
              onFocus={() => setIsLocationOpen(true)}
            />
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <div className="rounded-lg border shadow-md max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredAirports.length > 0 ? (
                filteredAirports.map((airport) => (
                  <button
                    key={airport.id}
                    onClick={() => handleLocationSelect(airport)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    <div className="font-medium">{airport.name}</div>
                    <div className="text-sm text-gray-500">
                      {airport.city && `${airport.city}, `}{airport.countryName}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No airports found</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date/Time */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn("w-full justify-start text-left font-normal", 
                    !selectedLocation && "opacity-50 cursor-not-allowed")}
                  disabled={!selectedLocation}
                  onClick={() => setIsStartCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d, yyyy") : <span>Start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                  disabled={(date) => isBefore(date, minStartDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select 
              value={startTime} 
              onValueChange={handleStartTimeSelect} 
              open={isStartTimeOpen} 
              onOpenChange={setIsStartTimeOpen}
              disabled={!startDate}
            >
              <SelectTrigger className={cn("w-[130px]", !startDate && "opacity-50 cursor-not-allowed")}>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate}</p>
          )}
        </div>

        {/* End Date/Time */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn("w-full justify-start text-left font-normal",
                    !startDate && "opacity-50 cursor-not-allowed")}
                  disabled={!startDate}
                  onClick={() => setIsEndCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d, yyyy") : <span>End date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  disabled={(date) => 
                    isBefore(date, minEndDate) || 
                    isAfter(date, maxEndDate)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select 
              value={endTime} 
              onValueChange={handleEndTimeSelect}
              open={isEndTimeOpen}
              onOpenChange={setIsEndTimeOpen}
              disabled={!endDate}
            >
              <SelectTrigger className={cn("w-[130px]", !endDate && "opacity-50 cursor-not-allowed")}>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate}</p>
          )}
        </div>
      </div>

      {errors.dates && (
        <p className="text-sm text-red-500 -mt-2">{errors.dates}</p>
      )}

      <LoadingButton 
        type="submit" 
        className="w-full md:w-fit"
        isLoading={isLoading}
        disabled={!isFormComplete}
      >
        <Search className="mr-2 h-4 w-4" />
        Search Parking
      </LoadingButton>
    </form>
  );
} 