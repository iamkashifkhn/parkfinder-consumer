import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { reviewService, Review } from "@/services/reviewService";
import { uploadService } from "@/services/uploadService";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    parkingLocation: {
      name: string;
    };
    startTime: string;
    endTime: string;
  } | null;
  onReviewSubmitted?: (review: Review) => void;
}

// Helper function for formatting dates consistently
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy");
};

const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
  );
};

export function ReviewDialog({ isOpen, onClose, booking, onReviewSubmitted }: ReviewDialogProps) {
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewSubmit = async () => {
    if (!booking || reviewRating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    try {
      setSubmittingReview(true);
      
      let imageUrls: string[] = [];
      
      // First upload images if any
      if (reviewImages.length > 0) {
        try {
          imageUrls = await uploadService.uploadFiles(reviewImages);
        } catch (error) {
          console.error("Error uploading images:", error);
          toast.error("Failed to upload images");
          return;
        }
      }
      
      // Create review payload
      const reviewPayload = {
        bookingId: booking.id,
        rating: reviewRating,
        review: reviewComment,
        images: imageUrls
      };

      // Submit review and get the response
      const createdReview = await reviewService.createReview(reviewPayload);
      
      // Reset form
      setReviewRating(0);
      setReviewComment('');
      setReviewImages([]);
      setReviewImagePreviews([]);
      
      // Close dialog and notify parent with the created review
      onClose();
      onReviewSubmitted?.(createdReview);
      
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDismiss = () => {
    setReviewRating(0);
    setReviewComment('');
    setReviewImages([]);
    setReviewImagePreviews([]);
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newFiles = files.slice(0, 5 - reviewImages.length);
    
    setReviewImages(prev => [...prev, ...newFiles]);
    
    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReviewImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setReviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
          <DialogDescription>
            Share your experience with this parking location
          </DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="font-medium">{booking.parkingLocation.name}</p>
              <p className="text-sm text-gray-500">
                {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
              </p>
            </div>
            
            <div>
              <Label className="mb-2 block">Rating *</Label>
              <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
            </div>

            <div>
              <Label htmlFor="reviewComment" className="mb-2 block">Review</Label>
              <Textarea
                id="reviewComment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                className="resize-none"
                rows={4}
              />
            </div>

            <div>
              <Label className="mb-2 block">Add Photos (Optional - Max 5)</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                  disabled={reviewImages.length >= 5}
                />
                {reviewImagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {reviewImagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt={`Review preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {reviewImages.length >= 5 && (
                  <p className="text-sm text-gray-500">Maximum 5 images allowed</p>
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleReviewDismiss}>
            Cancel
          </Button>
          <Button
            onClick={handleReviewSubmit}
            disabled={reviewRating === 0 || submittingReview}
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 