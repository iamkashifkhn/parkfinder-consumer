"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";
import { bookingService, CreateBookingPayload } from "@/services/bookingService";
import { useBookingStore } from "@/store/bookingStore";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// Key for session storage
const BOOKING_IN_PROGRESS_KEY = 'parkos_booking_in_progress';

interface PaymentFormProps {
  parkingId: string;
  startDate?: string;
  endDate?: string;
  services?: string;
  outboundFlight?: string;
  inboundFlight?: string;
  vehicles?: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  makeAndModel: string;
  vehicleType: string;
  numberOfPeople: string;
}

// API response with payment intent
interface BookingResponse {
  booking: {
    id: string;
    bookingId: number;
    totalAmount: string;
    parkingAmount: string;
    featuresAmount: string;
    // Other booking properties
  };
  payment: {
    id: string;
    clientSecret: string;
    amount: string;
    currency: string;
    status: string;
    // Other payment properties
  };
}

// Main component to create booking and render Stripe form
export function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const bookingCreationAttempted = useRef(false);
  const bookingDetails = useBookingStore();
  const router = useRouter();

  function toLocalISOString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
  
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  }

  // Create booking and get payment intent
  async function createBookingWithPaymentIntent() {
    // Check if a booking is already in progress using both ref and session storage
    if (bookingCreationAttempted.current) {
      console.log("Booking creation already attempted via ref, skipping duplicate call");
      return;
    }
    
    // Check session storage as well (persists across renders)
    const bookingInProgress = sessionStorage.getItem(BOOKING_IN_PROGRESS_KEY);
    if (bookingInProgress === 'true') {
      console.log("Booking creation already in progress via session storage, skipping duplicate call");
      return;
    }
    
    // Mark that we've attempted to create a booking (in both ref and session storage)
    bookingCreationAttempted.current = true;
    try {
      sessionStorage.setItem(BOOKING_IN_PROGRESS_KEY, 'true');
    } catch (e) {
      console.error("Failed to access session storage:", e);
    }
    
    try {
      setIsLoading(true);
      
      // Validate required booking details
      if (!bookingDetails.parkingId || !bookingDetails.startDate || !bookingDetails.endDate) {
        setBookingError('Missing required booking details');
        throw new Error('Missing required booking details');
      }

      // Map vehicles to the required format and include only service IDs
      const mappedVehicles = bookingDetails.vehicles.map(vehicle => ({
        licensePlateNumber: vehicle.licensePlate,
        makeAndModel: vehicle.makeAndModel,
        vehicleType: vehicle.vehicleType.toUpperCase() as 'SEDAN' | 'SUV' | 'VAN' | 'TRUCK',
        numberOfPeople: parseInt(vehicle.numberOfPeople),
        features: bookingDetails.selectedServices // Send only service IDs
      }));

      // Prepare booking payload
      const bookingPayload: CreateBookingPayload = {
        startTime: toLocalISOString(new Date(bookingDetails.startDate)),
        endTime: toLocalISOString(new Date(bookingDetails.endDate)),
        parkingLocationId: bookingDetails.parkingId,
        vehicles: mappedVehicles,
        outboundFlightNumber: bookingDetails.outboundFlight,
        inboundFlightNumber: bookingDetails.inboundFlight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      console.log("Creating booking with payload:", bookingPayload);

      // Create booking - API should return booking and payment intent
      const response = await bookingService.createBooking(bookingPayload);
      
      console.log("Booking created successfully:", response);
      
      // Extract booking and payment from response
      const responseData = response as unknown as BookingResponse;
      setBookingResponse(responseData);
      
      // Extract client secret from payment intent
      if (responseData && responseData.payment && responseData.payment.clientSecret) {
        setClientSecret(responseData.payment.clientSecret);
      } else {
        throw new Error('No payment intent was created');
      }
    } catch (error) {
      console.error("Booking creation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create booking. Please try again.");
      setBookingError(error instanceof Error ? error.message : "Failed to create booking");
      // Reset the attempt flags on error to allow retry
      bookingCreationAttempted.current = false;
      try {
        sessionStorage.removeItem(BOOKING_IN_PROGRESS_KEY);
      } catch (e) {
        console.error("Failed to access session storage:", e);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Call this once when component mounts - on client side only
  useEffect(() => {
    // This will run only once when the component is mounted
    createBookingWithPaymentIntent();
    
    // Cleanup function
    return () => {
      // We don't clear bookingCreationAttempted on unmount 
      // as this might be a component re-mount in strict mode
      console.log("Component unmounting, booking creation attempted:", bookingCreationAttempted.current);
    };
  }, []); // Empty dependency array to ensure it only runs once
  
  // Ensure we clean up session storage when leaving the page
  useEffect(() => {
    return () => {
      // Clean up our session storage flag when component is fully unmounted
      // This is especially important if the user navigates away
      window.addEventListener('beforeunload', () => {
        try {
          sessionStorage.removeItem(BOOKING_IN_PROGRESS_KEY);
        } catch (e) {
          console.error("Failed to access session storage:", e);
        }
      });
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p>Preparing payment form...</p>
        </div>
      </Card>
    );
  }

  // Show error state if booking creation failed
  if (bookingError) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 py-8">
          <CreditCard className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-center">Unable to Process Payment</h2>
          <p className="text-center text-gray-500 max-w-md">
            {bookingError}
          </p>
          <Button onClick={() => {
            // Clear booking flags and allow retry
            bookingCreationAttempted.current = false;
            try {
              sessionStorage.removeItem(BOOKING_IN_PROGRESS_KEY);
            } catch (e) {
              console.error("Failed to access session storage:", e);
            }
            router.back();
          }}>
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  // If we have the client secret, we can render the Stripe payment form
  if (clientSecret) {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
      },
      // paymentMethodTypes is not compatible with clientSecret mode
    };

    return (
      <Elements stripe={stripePromise} options={options}>
        <StripeCheckoutForm bookingResponse={bookingResponse} />
      </Elements>
    );
  }

  // Fallback - should not usually reach here
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4 py-8">
        <CreditCard className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-center">Something went wrong</h2>
        <p className="text-center text-gray-500 max-w-md">
          Unable to initialize payment form. Please try again later.
        </p>
        <Button onClick={() => {
          // Clear booking flags and allow retry
          bookingCreationAttempted.current = false;
          try {
            sessionStorage.removeItem(BOOKING_IN_PROGRESS_KEY);
          } catch (e) {
            console.error("Failed to access session storage:", e);
          }
          router.back();
        }}>
          Go Back
        </Button>
      </div>
    </Card>
  );
}

// Stripe checkout form component (used inside Elements)
function StripeCheckoutForm({ bookingResponse }: { bookingResponse: BookingResponse | null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const bookingDetails = useBookingStore();
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (!stripe || !elements || !bookingResponse) {
        throw new Error('Stripe has not been initialized or booking data is missing');
      }

      setIsSubmitting(true);
      setPaymentError(null);

      // Submit payment using Stripe's confirmPayment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + `/booking/${bookingDetails.parkingId}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        toast.success("Payment successful!");
        
        // Save booking details to store
        bookingDetails.setBookingDetails({
          ...bookingDetails,
          bookingId: bookingResponse.booking.id,
          payment: {
            cardNumber: "****",
            cardholderName: "Stripe Payment",
            timestamp: new Date().toISOString()
          }
        });

        // Construct query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('start', bookingDetails.startDate || '');
        queryParams.append('end', bookingDetails.endDate || '');
        if (bookingDetails.selectedServices && bookingDetails.selectedServices.length > 0) {
          queryParams.append('services', bookingDetails.selectedServices.join(','));
        }
        queryParams.append('outbound', bookingDetails.outboundFlight || '');
        queryParams.append('inbound', bookingDetails.inboundFlight || '');
        queryParams.append('vehicles', JSON.stringify(bookingDetails.vehicles || []));
        queryParams.append('bookingId', bookingResponse.booking.id);

        // Clear the booking in progress flag
        try {
          sessionStorage.removeItem(BOOKING_IN_PROGRESS_KEY);
        } catch (e) {
          console.error("Failed to access session storage:", e);
        }

        // Navigate to confirmation page with all parameters
        router.push(`/booking/${bookingDetails.parkingId}/confirmation?${queryParams.toString()}`);
      } else {
        // Payment requires further actions
        toast.info(`Payment status: ${paymentIntent?.status || 'processing'}. Additional steps may be required.`);
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment failed");
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Payment Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement options={{
          // Only show credit card fields, hide other payment methods
          layout: { type: 'tabs', defaultCollapsed: false },
          paymentMethodOrder: ['card'],
          // Hide specific payment methods (must be configured server-side as well)
          wallets: {
            applePay: 'never',
            googlePay: 'never'
          }
        }} />
        
        {paymentError && (
          <p className="text-sm text-red-500 mt-1">{paymentError}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !stripe || !elements}
        >
          {isSubmitting ? "Processing Payment..." : "Pay Now"}
        </Button>
      </form>
    </Card>
  );
}