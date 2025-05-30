"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Star,  Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInHours, isPast } from "date-fns";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { bookingService, Booking as BookingType } from "@/services/bookingService";
import { Review } from "@/services/reviewService";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencySymbol } from "@/components/CurrencySymbol";
import { ReviewDialog } from "@/components/ReviewDialog";
import { CancellationDialog } from "@/components/CancellationDialog";

// Filter types
type BookingStatusFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// Helper function to get payment status badge variant
const getPaymentStatusBadgeVariant = (payments: any[] = []) => {
  const completedPayment = payments?.find(p => p.status === 'COMPLETED');
  return completedPayment ? 'default' : 'destructive';
};

// Helper function for formatting dates consistently
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy");
};

// Update BookingType to include review
type BookingWithReview = BookingType & {
  review?: Review;
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the debounce hook for search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Dialog states
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getBookings({
          searchQuery: debouncedSearchQuery,
          bookingStatus: statusFilter === 'all' ? undefined : statusFilter,
          page: currentPage,
          limit: itemsPerPage
        });
        setBookings(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.total);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Get booking being cancelled
  const bookingToCancel = bookings.find(booking => booking.id === cancelBookingId);
  
  // Get booking being reviewed
  const bookingToReview = bookings.find(booking => booking.id === reviewBookingId);
  
  // Check if booking is within 24 hours (for UI display)
  const isWithin24Hours = (startDate: string): boolean => {
    const bookingStart = new Date(startDate);
    const now = new Date();
    return differenceInHours(bookingStart, now) <= 24;
  };
  
  const handleCancelClick = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setShowCancellationDialog(true);
  };

  const handleCancellationSuccess = (bookingId: string) => {
    // Update booking status locally
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CANCELLED' as const } 
          : booking
      )
    );
    setShowCancellationDialog(false);
    setCancelBookingId(null);
  };

  const handleCancellationDialogClose = () => {
    setShowCancellationDialog(false);
    setCancelBookingId(null);
  };

  const handleViewDetails = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };

  const handleReviewClick = (bookingId: string) => {
    setReviewBookingId(bookingId);
    setShowReviewDialog(true);
  };

  const handleReviewSubmitted = (review: Review) => {
    // Update local state with the actual review data
    if (reviewBookingId) {
      setBookings(prev => 
        prev.map(booking => 
          booking.id === reviewBookingId 
            ? { ...booking, review } 
            : booking
        )
      );
    }
    setShowReviewDialog(false);
    setReviewBookingId(null);
  };

  const handleReviewDialogClose = () => {
    setShowReviewDialog(false);
    setReviewBookingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl pt-24 pb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Bookings</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your parking bookings
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search bookings..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as BookingStatusFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{booking.parkingLocation.name}</h3>
                    <Badge
                      variant={
                        booking.status === 'CONFIRMED'
                          ? 'default'
                          : booking.status === 'COMPLETED'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {booking.status}
                    </Badge>
                    <Badge variant={getPaymentStatusBadgeVariant(booking.payments || [])}>
                      {booking.payments?.find(p => p.status === 'COMPLETED') ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {booking.parkingLocation.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="text-lg font-semibold">
                    <CurrencySymbol/>{parseFloat(booking.totalAmount).toFixed(2)}
                  </div>
                  {booking.review && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span>{booking.review.rating}/5</span>
                      {booking.review.images.length > 0 && (
                        <span className="text-xs">• {booking.review.images.length} photo{booking.review.images.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(booking.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {booking.status === 'CONFIRMED' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelClick(booking.id)}
                        disabled={isWithin24Hours(booking.startTime)}
                      >
                        Cancel
                      </Button>
                    )}
                    {booking.status === 'COMPLETED' && !booking.review && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewClick(booking.id)}
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Add Review
                      </Button>
                    )}
                    {booking.status === 'COMPLETED' && booking.review && (
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Reviewed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {bookings.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Dialog */}
      <CancellationDialog
        isOpen={showCancellationDialog}
        onClose={handleCancellationDialogClose}
        booking={bookingToCancel || null}
        onCancellationSuccess={handleCancellationSuccess}
      />

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={showReviewDialog}
        onClose={handleReviewDialogClose}
        booking={bookingToReview || null}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
} 