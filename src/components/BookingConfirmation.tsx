"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Car,
  Share2,
  Download,
  Mail,
} from "lucide-react";

interface BookingConfirmationProps {
  parkingId: string;
  startDate?: string;
  endDate?: string;
}

interface BookingDetails {
  bookingRef: string;
  parkingName: string;
  address: string;
  price: number;
  instructions: string[];
}

export function BookingConfirmation({
  parkingId,
  startDate,
  endDate,
}: BookingConfirmationProps) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  useEffect(() => {
    // Simulate API call to fetch booking details
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setBooking({
          bookingRef: "PK" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          parkingName: "Airport Premium Parking",
          address: "Terminal 1, Frankfurt Airport, 60547 Frankfurt am Main, Germany",
          price: 149.97,
          instructions: [
            "Show your booking confirmation at the entrance",
            "Park in any available spot in Zone A",
            "Keep your parking ticket with you",
            "The shuttle runs every 15 minutes to the terminal",
            "For assistance, call +49 123 456 789",
          ],
        });
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [parkingId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your booking reference: <span className="font-mono">{booking.bookingRef}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* Booking Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">{booking.parkingName}</h3>
                <p className="text-sm text-muted-foreground">{booking.address}</p>
              </div>
            </div>

            {startDate && endDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium">Parking Period</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(startDate), "PPP")} -{" "}
                    {format(new Date(endDate), "PPP")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Shuttle Service</h3>
                <p className="text-sm text-muted-foreground">
                  Available 24/7, every 15 minutes
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-3">Parking Instructions</h3>
            <ul className="space-y-2">
              {booking.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Car className="w-4 h-4 mt-0.5 text-primary" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button className="flex-1" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email Confirmation
            </Button>
            <Button className="flex-1" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="text-center space-y-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need to modify your booking?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/account/bookings">Manage Booking</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 