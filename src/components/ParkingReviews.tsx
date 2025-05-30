"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Image as ImageIcon, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reviewService, type ReviewsResponse } from "@/services/reviewService";
import { format } from "date-fns";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ParkingReviewsProps {
  id: string;
}

export function ParkingReviews({ id }: ParkingReviewsProps) {
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getParkingSpaceReviews(id, page);
        setReviews(data);
        setError(null);
      } catch (err) {
        setError("Failed to load reviews. Please try again later.");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [id, page]);

  if (loading && !reviews) {
    return <ReviewsSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <MessageSquare className="w-12 h-12 text-destructive/20 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Reviews</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  if (!reviews?.data.length) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="bg-primary/5 p-4 rounded-full mb-4">
            <MessageSquare className="w-12 h-12 text-primary/40" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-2 max-w-md">
            No reviews have been added for this parking space yet.
          </p>
          <p className="text-muted-foreground max-w-md">
            Once reviews are available, you'll see them here.
          </p>
        </div>
      </Card>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews.data.filter(r => r.rating === 5).length,
    4: reviews.data.filter(r => r.rating === 4).length,
    3: reviews.data.filter(r => r.rating === 3).length,
    2: reviews.data.filter(r => r.rating === 2).length,
    1: reviews.data.filter(r => r.rating === 1).length,
  };

  const maxRatingCount = Math.max(...Object.values(ratingDistribution));

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Overall Rating */}
          <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-5xl font-bold text-primary mb-2">
              {reviews.meta.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(reviews.meta.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {reviews.meta.total} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2 space-y-3">
            {Object.entries(ratingDistribution).reverse().map(([rating, count]) => (
              <div key={rating} className="flex items-center gap-2">
                <div className="w-12 text-sm font-medium">{rating} stars</div>
                <Progress 
                  value={(count / maxRatingCount) * 100} 
                  className="h-2 flex-1"
                />
                <div className="w-12 text-sm text-muted-foreground text-right">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.data.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            {/* Review Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {review.userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">Anonymous User</h4>
                      <Badge variant="secondary" className="text-xs">
                        Verified Stay
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(review.createdAt), "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Review Content with Image */}
            <div className="p-6">
              <div className="flex gap-6">
                {/* Review Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>
                </div>

                {/* Review Image */}
                {review.images && review.images.length > 0 && (
                  <div className="flex-shrink-0 w-32 h-32">
                    <div
                      className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedImage(review.images[0])}
                    >
                      <Image
                        src={review.images[0]}
                        alt="Review image"
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      {review.images.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-medium">
                          +{review.images.length - 1}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {reviews.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-2"
          >
            Previous
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {reviews.meta.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(reviews.meta.totalPages, p + 1))}
            disabled={page === reviews.meta.totalPages}
            className="gap-2"
          >
            Next
          </Button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl aspect-video">
            <Image
              src={selectedImage}
              alt="Review image"
              fill
              className="object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg">
            <Skeleton className="h-12 w-20 mb-2" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="md:col-span-2 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="flex-shrink-0">
                <Skeleton className="w-32 h-32 rounded-lg" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 