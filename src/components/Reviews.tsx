"use client";

// import { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Review = {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  image: string;
  title: string;
};

const reviews: Review[] = [
  {
    id: 1,
    name: "Michael S.",
    location: "Frankfurt Airport",
    rating: 5,
    title: "Excellent Service",
    comment: "Great service! The shuttle was on time and the staff was very friendly. The parking facility was secure and well-maintained.",
    date: "March 15, 2024",
    image: "/images/testimonials/person-1.jpg",
  },
  {
    id: 2,
    name: "Anna K.",
    location: "Munich Airport",
    rating: 4,
    title: "Smooth Experience",
    comment: "Easy booking process and good value for money. The parking spot was exactly as described. Will use again.",
    date: "March 10, 2024",
    image: "/images/testimonials/person-2.jpg",
  },
  {
    id: 3,
    name: "Thomas B.",
    location: "Berlin Brandenburg",
    rating: 5,
    title: "Highly Recommended",
    comment: "Perfect experience from start to finish. The parking was close to the terminal and the price was very reasonable.",
    date: "March 5, 2024",
    image: "/images/testimonials/person-3.jpg",
  },
  {
    id: 4,
    name: "Sarah M.",
    location: "Hamburg Airport",
    rating: 5,
    title: "Outstanding Experience",
    comment: "The whole process was seamless from booking to pickup. The shuttle service was frequent and the staff were professional. Highly recommend!",
    date: "March 2, 2024",
    image: "/images/testimonials/person-4.jpg",
  },
  {
    id: 5,
    name: "David R.",
    location: "Düsseldorf Airport",
    rating: 4,
    title: "Great Value Parking",
    comment: "Found a great deal through this platform. The parking facility was clean and secure. Will definitely use this service for my next trip.",
    date: "February 28, 2024",
    image: "/images/testimonials/person-5.jpg",
  }
];

export function Reviews() {
  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {reviews.map((review) => (
            <CarouselItem 
              key={review.id} 
              className="pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <ReviewCard review={review} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 sm:-left-12" />
        <CarouselNext className="-right-4 sm:-right-12" />
      </Carousel>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={review.image}
            alt={review.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{review.name}</h3>
          <p className="text-sm text-gray-500">{review.location}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
            )}
          />
        ))}
      </div>

      <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
      <p className="text-gray-600 text-sm line-clamp-4">{review.comment}</p>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-400">{review.date}</p>
      </div>
    </div>
  );
} 