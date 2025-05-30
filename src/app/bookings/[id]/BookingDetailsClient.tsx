"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  Plane,
  Car,
  CreditCard,
  ArrowLeft,
  AlertCircle,
  Info,
  Tag,
  Lock,
  Star,
} from "lucide-react";
import { bookingService, Booking } from "@/services/bookingService";
import { reviewService } from "@/services/reviewService";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CurrencySymbol } from "@/components/CurrencySymbol";
import { ReviewDialog } from "@/components/ReviewDialog";
import { CancellationDialog } from "@/components/CancellationDialog";
// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// Helper function for formatting dates consistently
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy HH:mm");
};

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case 'PENDING':
    case 'CONFIRMED':
      return 'default';
    case 'COMPLETED':
      return 'secondary';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'default';
  }
};

// Helper function to get payment status badge variant
const getPaymentStatusBadgeVariant = (payments: any[]) => {
  const completedPayment = payments?.find(p => p.status === 'COMPLETED');
  return completedPayment ? 'default' : 'destructive';
};

// Component to handle payments for existing bookings
function BookingPaymentForm({ booking, onPaymentSuccess }: { booking: Booking, onPaymentSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedPayment, setHasAttemptedPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    async function getPaymentDetails() {
      try {
        // Find pending payment in the booking data
        const pendingPayment = booking.payments?.find(p => p.status === 'PENDING');
        
        console.log("Available payments:", booking.payments);
        console.log("Found pending payment:", pendingPayment);
        
        if (!pendingPayment) {
          throw new Error("No pending payment found for this booking");
        }
        
        if (!pendingPayment.paymentIntentId) {
          throw new Error("This booking doesn't have a valid payment intent");
        }
        
        // Get the full payment intent from the server using the payment intent ID
        const paymentIntent = await bookingService.getPaymentIntentSecret(pendingPayment.paymentIntentId);
        
        console.log("Retrieved payment intent:", paymentIntent);
        
        if (!paymentIntent.client_secret) {
          throw new Error("No client secret available for this payment intent");
        }
        
        // Store the payment status for informational purposes
        setPaymentStatus(paymentIntent.status);
        
        // Set the client secret from the payment intent
        setClientSecret(paymentIntent.client_secret);
      } catch (err) {
        console.error("Error getting payment details:", err);
        setError(err instanceof Error ? err.message : "Failed to set up payment");
      } finally {
        setIsLoading(false);
        setHasAttemptedPayment(true);
      }
    }

    getPaymentDetails();
  }, [booking]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
        {hasAttemptedPayment && (
          <p className="text-xs text-gray-600 mt-2">
            Please contact customer support if you believe this is an error.
          </p>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (paymentStatus && paymentStatus !== 'requires_payment_method' && paymentStatus !== 'requires_action') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-600">
          This payment is currently in status: <strong>{paymentStatus}</strong>
        </p>
        <p className="text-xs text-gray-600 mt-2">
          You may need to wait or contact support if the payment is being processed.
        </p>
      </div>
    );
  }

  if (clientSecret) {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
      },
    };

    return (
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm bookingId={booking.id} onSuccess={onPaymentSuccess} />
      </Elements>
    );
  }

  return null;
}

// Stripe checkout form component
function StripePaymentForm({ bookingId, onSuccess }: { bookingId: string, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe has not been initialized');
      }

      setIsSubmitting(true);
      setPaymentError(null);

      // Submit payment using Stripe's confirmPayment
      // We're using an existing payment intent, so we just need to confirm it
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return to the same booking page after payment
          return_url: window.location.origin + `/bookings/${bookingId}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error("Payment error:", error);
        throw new Error(error.message || 'Payment failed');
      } else if (paymentIntent) {
        // Set the payment status so we can show the appropriate message
        setPaymentStatus(paymentIntent.status);
        
        if (paymentIntent.status === 'succeeded') {
          // Payment successful
          toast.success("Payment successful!");
          onSuccess();
        } else if (paymentIntent.status === 'processing') {
          // Payment is processing
          toast.info("Your payment is processing. We'll update you when it's complete.");
        } else if (paymentIntent.status === 'requires_action') {
          // Further action is required
          toast.info("Additional verification is required. Please follow the instructions.");
        } else {
          // Other status
          toast.info(`Payment status: ${paymentIntent.status}. Please wait or try again.`);
        }
      } else {
        // No payment intent returned
        throw new Error("No payment information returned");
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment failed");
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show a message based on payment status
  if (paymentStatus) {
    if (paymentStatus === 'succeeded') {
      return (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Payment successful!</p>
          <p className="text-xs text-gray-600 mt-2">
            Thank you for your payment. Your booking is now confirmed.
          </p>
        </div>
      );
    }
    
    if (paymentStatus === 'processing') {
      return (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Payment is processing</p>
          <p className="text-xs text-gray-600 mt-2">
            Your payment is being processed. We'll update you when it's complete.
          </p>
        </div>
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{
        layout: { type: 'tabs', defaultCollapsed: false },
        paymentMethodOrder: ['card'],
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
  );
}

interface Review {
  id: string;
  userId: string;
  parkingLocationId: string;
  bookingId: string;
  rating: number;
  review: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface BookingWithReview extends Booking {
  review?: Review;
}

interface BookingDetailsClientProps {
  bookingId: string;
}

export default function BookingDetailsClient({ bookingId }: BookingDetailsClientProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data as BookingWithReview);
        setError(null);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePaymentSuccess = async () => {
    // Refresh booking data after successful payment
    try {
      setLoading(true);
      const updatedBooking = await bookingService.getBookingById(bookingId);
      setBooking(updatedBooking);
      setShowPaymentForm(false);
    } catch (err) {
      console.error("Error refreshing booking details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = () => {
    setShowReviewDialog(true);
  };

  const handleReviewSubmitted = () => {
    setHasReview(true);
    setShowReviewDialog(false);
    toast.success("Review submitted successfully!");
  };

  const handleReviewDialogClose = () => {
    setShowReviewDialog(false);
  };

  const handleCancelClick = () => {
    setShowCancellationDialog(true);
  };

  const handleCancellationSuccess = (bookingId: string) => {
    // Update booking status locally
    if (booking) {
      setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    }
    setShowCancellationDialog(false);
  };

  const handleCancellationDialogClose = () => {
    setShowCancellationDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Booking</h2>
          <p className="text-gray-500 mb-4">{error || "Booking not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const completedPayment = booking.payments?.find(p => p.status === 'COMPLETED');
  const isPaid = !!completedPayment;
  const paymentIntentId = completedPayment?.paymentIntentId;

  return (
    <div className="mx-auto max-w-7xl py-24 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Booking Status Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold mb-2">Booking Details</h1>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(booking.status)}>
                  {booking.status}
                </Badge>
                <Badge variant={getPaymentStatusBadgeVariant(booking.payments || [])}>
                  {isPaid ? "Paid" : "Unpaid"}
                </Badge>
                {booking.status === 'COMPLETED' && booking.review && (
                  <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {booking.review.rating}/5 Rating
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-sm text-gray-500">Booking Reference</div>
                <div className="font-mono">{booking.bookingId}</div>
              </div>
              {booking.status === 'COMPLETED' && !booking.review && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReviewClick}
                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Add Review
                </Button>
              )}
              {booking.status === 'CONFIRMED' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelClick}
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Parking Location Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Parking Location</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">{booking.parkingLocation.name}</div>
                <div className="text-sm text-gray-500">{booking.parkingLocation.address}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {booking.parkingLocation.city}, {booking.parkingLocation.state}, {booking.parkingLocation.country}
                </div>
                {booking.parkingLocation.description && (
                  <div className="text-sm text-gray-500 mt-2">
                    <Info className="h-4 w-4 inline mr-1" />
                    {booking.parkingLocation.description}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-gray-500">
                  {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Parking Type</div>
                <div className="text-sm text-gray-500 capitalize">
                  {booking.parkingLocation.parkingType.toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Flight Information Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Flight Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Plane className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Outbound Flight</div>
                <div className="text-sm text-gray-500">
                  {booking.outboundFlightNumber || "Not specified"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Plane className="h-5 w-5 text-gray-500 mt-0.5 rotate-180" />
              <div>
                <div className="font-medium">Inbound Flight</div>
                <div className="text-sm text-gray-500">
                  {booking.inboundFlightNumber || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Vehicle Information Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
          <div className="space-y-6">
            {booking.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Vehicle Details</div>
                    <div className="text-sm text-gray-500">
                      {vehicle.makeAndModel} ({vehicle.vehicleType})
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      License Plate: {vehicle.licensePlateNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      Passengers: {vehicle.numberOfPeople}
                    </div>
                  </div>
                </div>
                {vehicle.features.length > 0 && (
                  <div className="pl-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Features</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {vehicle.features.map((feature) => (
                        <div 
                          key={feature.featureId} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <span className="text-sm text-gray-700">{feature.feature.name}</span>
                          <span className="text-sm font-medium text-gray-900">
                            <CurrencySymbol/>{parseFloat(feature.featurePrice).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Information Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="w-full">
                <div className="font-medium">Payment Details</div>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Parking Amount:</span>
                    <span><CurrencySymbol/>{parseFloat(booking.parkingAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Features Amount:</span>
                    <span><CurrencySymbol/>{parseFloat(booking.featuresAmount).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span className="text-lg"><CurrencySymbol/>{parseFloat(booking.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-3">
                  Payment Status: {isPaid ? "Paid" : "Unpaid"}
                </div>

                {/* Display cancellation reason if booking is cancelled */}
                {booking.status === "CANCELLED" && booking.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-800">Cancellation Reason:</div>
                    <div className="text-sm text-red-700 mt-1">{booking.cancellationReason}</div>
                  </div>
                )}

                {/* Display refund information if available */}
                {booking.payments && booking.payments.length > 0 && booking.payments.some(p => p.refunds && p.refunds.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-700 mb-3">Refund Information</h3>
                    {booking.payments.map((payment: any) => 
                      payment.refunds && payment.refunds.length > 0 ? (
                        <div key={payment.id} className="space-y-3">
                          {payment.refunds.map((refund: any) => (
                            <div key={refund.id} className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Refund Amount:</span>
                                <span className="font-medium text-green-600">
                                  <CurrencySymbol/>{parseFloat(refund.amount).toFixed(2)} {payment.currency}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Refund Status:</span>
                                <Badge 
                                  className={
                                    refund.status === "COMPLETED" 
                                      ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                      : refund.status === "FAILED" 
                                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  }
                                >
                                  {refund.status}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-600">Refund Reason:</span>
                                <span className="text-sm text-right max-w-xs">{refund.reason}</span>
                              </div>
                              {refund.completedAt && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Refunded at:</span>
                                  <span className="text-sm">{format(new Date(refund.completedAt), "MMM dd, yyyy HH:mm")}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null
                    )}
                  </div>
                )}
                
                {!isPaid && !showPaymentForm && booking.status !== 'CANCELLED' && (
                  <Button 
                    className="mt-4 w-full flex items-center justify-center gap-2"
                    onClick={() => setShowPaymentForm(true)}
                  >
                    <CreditCard className="h-4 w-4" /> Pay Now
                  </Button>
                )}
                
                {!isPaid && showPaymentForm && booking.status !== 'CANCELLED' && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-md font-medium mb-4">Complete Payment</h3>
                    <BookingPaymentForm 
                      booking={booking} 
                      onPaymentSuccess={handlePaymentSuccess} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Review Card - Only show if there's a review */}
        {booking.review && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Review</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < (booking.review?.rating ?? 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {booking.review?.createdAt && format(new Date(booking.review.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
              
              <div className="text-gray-700">
                {booking.review?.review}
              </div>

              {booking.review?.images?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Review Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {booking.review?.images?.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="rounded-lg object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Cancellation Dialog */}
      <CancellationDialog
        isOpen={showCancellationDialog}
        onClose={handleCancellationDialogClose}
        booking={booking}
        onCancellationSuccess={handleCancellationSuccess}
      />

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={showReviewDialog}
        onClose={handleReviewDialogClose}
        booking={booking}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
} 