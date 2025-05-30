"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { publicParkingService, ParkingSpace } from "@/services/parkingSpaceService";
import { LoadingSpinner } from "@/components/ui/loading";
import { bookingService, ParkingAmountResponse } from "@/services/bookingService";
import { useBookingStore } from "@/store/bookingStore";



interface ParkingBookingCardProps {
  id: string;
  startDate?: Date;
  endDate?: Date;
}

// Generate time options
const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    options.push(`${hour.toString().padStart(2, "0")}:${minute}`);
  }
  return options;
};

const timeOptions = generateTimeOptions();

export function ParkingBookingCard({ id, startDate, endDate }: ParkingBookingCardProps) {
  console.log("ParkingBookingCard rendered with id:", id, startDate, endDate);
  console.log("Start date timezone offset:", startDate?.getTimezoneOffset());
  console.log("End date timezone offset:", endDate?.getTimezoneOffset());
  const router = useRouter();
  const setBookingDetails = useBookingStore((state) => state.setBookingDetails);
  
  // Extract time from startDate and endDate if provided (in user's local timezone)
  const extractTimeFromDate = (date: Date | undefined) => {
    if (!date) return "12:00";
    // Ensure we're working with the local timezone
    const localDate = new Date(date.getTime());
    const hours = localDate.getHours().toString().padStart(2, "0");
    const minutes = localDate.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    return timeString;
  };
  
  // Ensure dates are in local timezone
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    startDate ? new Date(startDate.getTime()) : undefined
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    endDate ? new Date(endDate.getTime()) : undefined
  );
  const [selectedStartTime, setSelectedStartTime] = useState(extractTimeFromDate(startDate));
  const [selectedEndTime, setSelectedEndTime] = useState(extractTimeFromDate(endDate));
  const [parkingData, setParkingData] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [priceSegments, setPriceSegments] = useState<ParkingAmountResponse['priceSegments']>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        setLoading(true);
        const data = await publicParkingService.getPublicParkingSpaceById(id);
        setParkingData(data);
      } catch (err) {
        console.error("Error fetching parking details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchParkingData();
    }
  }, [id]);

  useEffect(() => {
    const fetchParkingAmount = async () => {
      if (!selectedStartDate || !selectedEndDate) return;

      try {
        const startAt = `${format(selectedStartDate, 'yyyy-MM-dd')}T${selectedStartTime}:00`;
        const endAt = `${format(selectedEndDate, 'yyyy-MM-dd')}T${selectedEndTime}:00`;
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await bookingService.getParkingAmount(id, userTimezone, startAt, endAt);
        setCalculatedAmount(response.totalAmount);
        setPriceSegments(response.priceSegments);
        setIsAvailable(response?.isAvailable)
      } catch (err) {
        console.error('Error fetching parking amount:', err);
      }
    };


    fetchParkingAmount();
  }, [id, selectedStartDate, selectedEndDate, selectedStartTime, selectedEndTime]);

  const handleBookNow = () => {
    if (!selectedStartDate || !selectedEndDate) return;

    // Format dates for API and navigation
    const startAt = `${format(selectedStartDate, 'yyyy-MM-dd')}T${selectedStartTime}:00`;
    const endAt = `${format(selectedEndDate, 'yyyy-MM-dd')}T${selectedEndTime}:00`;
    
    // Save booking information to store
    setBookingDetails({
      parkingId: id,
      startDate: startAt,
      endDate: endAt,
      amount: calculatedAmount,
    });

    // Format dates in local format (YYYY-MM-DD HH:MM)
    const formatLocalDateTime = (date: Date, time: string) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${time}`;
    };

    // Navigate to booking page with local datetime format
    const formattedStartDate = formatLocalDateTime(selectedStartDate, selectedStartTime);
    const formattedEndDate = formatLocalDateTime(selectedEndDate, selectedEndTime);
    router.push(`/booking/${id}?start=${formattedStartDate}&end=${formattedEndDate}`);
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    // Ensure we display in user's local timezone
    return format(date, "MMM dd, yyyy HH:mm");
  };

  const calculateSegmentDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return days.toFixed(1);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  if (!parkingData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Unable to load parking information
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Date Selections */}
        <div className="space-y-4">
          {/* Drop-off Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Drop-off Date</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedStartDate ? format(selectedStartDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                <SelectTrigger className="w-[130px]">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time" />
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
          </div>

          {/* Pick-up Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pick-up Date</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedEndDate ? format(selectedEndDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={setSelectedEndDate}
                    initialFocus
                    disabled={(date) => selectedStartDate ? date < selectedStartDate : date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                <SelectTrigger className="w-[130px]">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time" />
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
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Price Breakdown</div>
          <div className="space-y-3">
            {priceSegments.map((segment, index) => (
              <div key={index} className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {formatDateTime(segment.startTime)} - {formatDateTime(segment.endTime)}
                  </span>
                  <span className="font-medium">€{segment.pricePerDay}/day</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Duration: {calculateSegmentDuration(segment.startTime, segment.endTime)} days</span>
                    <span>€{(segment.pricePerDay * parseFloat(calculateSegmentDuration(segment.startTime, segment.endTime))).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price */}
        <div className="border-t border-b py-4">
          <div className="flex justify-between items-center font-medium">
            <div className="text-lg">Total</div>
            <div className="text-lg font-bold">
              €{typeof calculatedAmount === 'number' ? calculatedAmount.toFixed(2) : 'Error fetching amount'}
            </div>
          </div>
        </div>

        {/* Book Button */}
        <Button 
          className="w-full"
          size="lg"
          onClick={handleBookNow}
          disabled={!selectedStartDate || !selectedEndDate || !isAvailable}
        >
          {parkingData.availableSlots > 0 ? "Book Now" : "No Slots Available"}
        </Button>
        
        {/* Cancellation Policy */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Free cancellation up to 24h before arrival</span>
        </div>
      </div>
    </Card>
  );
} 