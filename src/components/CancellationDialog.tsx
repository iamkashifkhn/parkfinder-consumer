import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, differenceInHours } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { bookingService } from "@/services/bookingService";

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    parkingLocation: {
      name: string;
    };
    startTime: string;
    endTime: string;
    totalAmount: string;
  } | null;
  onCancellationSuccess?: (bookingId: string) => void;
}

// Helper function for formatting dates consistently
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy");
};

// Check if booking is within 24 hours
const isWithin24Hours = (startDate: string): boolean => {
  const bookingStart = new Date(startDate);
  const now = new Date();
  return differenceInHours(bookingStart, now) <= 24;
};

// Calculate refund based on hours difference
const calculateRefund = (startDate: string, price: number) => {
  const bookingStart = new Date(startDate);
  const now = new Date();
  const hoursDiff = differenceInHours(bookingStart, now);
  
  if (hoursDiff > 72) {
    return { amount: price, percentage: 100 };
  } else if (hoursDiff > 24) {
    return { amount: price * 0.5, percentage: 50 };
  } else {
    return { amount: 0, percentage: 0 };
  }
};

export function CancellationDialog({ isOpen, onClose, booking, onCancellationSuccess }: CancellationDialogProps) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [submittingCancellation, setSubmittingCancellation] = useState(false);

  const handleCancelConfirm = async () => {
    if (!booking) return;
    
    try {
      setSubmittingCancellation(true);
      
      // Call the cancelBooking API with reason
      await bookingService.cancelBooking(booking.id, cancellationReason);
      
      // Reset form
      setCancellationReason('');
      
      // Close dialog and notify parent
      onClose();
      onCancellationSuccess?.(booking.id);
      
      // Show success toast
      toast.success("Booking cancelled successfully. You'll receive a confirmation email shortly.");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setSubmittingCancellation(false);
    }
  };
  
  const handleCancelDismiss = () => {
    setCancellationReason('');
    onClose();
  };

  if (!booking) return null;

  const within24Hours = isWithin24Hours(booking.startTime);
  const refundInfo = calculateRefund(booking.startTime, parseFloat(booking.totalAmount));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <p className="font-medium">{booking.parkingLocation.name}</p>
          <p className="text-sm text-gray-500">
            {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
          </p>
          {within24Hours && (
            <div className="flex items-center gap-2 text-yellow-600 mt-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                This booking is within 24 hours of start time. Cancellation may not be possible.
              </p>
            </div>
          )}
          {!within24Hours && (
            <div className="mt-2">
              <p className="text-sm font-medium">Refund Information:</p>
              <p className="text-sm text-gray-500">
                You will receive a {refundInfo.percentage}% refund
                (${refundInfo.amount.toFixed(2)})
              </p>
            </div>
          )}
        </div>
        <div className="py-4">
          <Label htmlFor="cancellationReason" className="mb-2 block">Reason for cancellation</Label>
          <Textarea
            id="cancellationReason"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please provide a reason for cancellation"
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancelDismiss}>
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelConfirm}
            disabled={within24Hours || !cancellationReason.trim() || submittingCancellation}
          >
            {submittingCancellation ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 