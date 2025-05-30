/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
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

interface SearchFormInlineProps {
  defaultLocation?: string;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
  defaultStartTime?: string;
  defaultEndTime?: string;
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

export function SearchFormInline({
  defaultLocation = '',
  defaultStartDate,
  defaultEndDate,
  defaultStartTime = "12:00",
  defaultEndTime = "12:00"
}: SearchFormInlineProps) {
  const router = useRouter();
  const [location, setLocation] = useState(defaultLocation);
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultEndDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !location) return;

    // Create dates with times
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

    const params = new URLSearchParams({
      location,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString()
    });

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="grid grid-cols-7 gap-2 w-full">
      <Input
        placeholder="Where are you parking?"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="col-span-2 min-w-[150px]"
      />

      <div className="col-span-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full min-w-[100px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "MMM d") : "Start"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="col-span-1">
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger className="w-full min-w-[80px]">
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

      <div className="col-span-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full min-w-[100px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "MMM d") : "End"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="col-span-1">
        <Select value={endTime} onValueChange={setEndTime}>
          <SelectTrigger className="w-full min-w-[80px]">
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

      <Button type="submit" className="col-span-1 w-full min-w-[100px]">
        Search
      </Button>
    </form>
  );
} 