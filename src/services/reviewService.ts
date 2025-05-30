import axios, { AxiosInstance } from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptors';

export interface ReviewPayload {
  bookingId: string;
  rating: number;
  review: string;
  images: string[];
}

export interface Review {
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

export interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    averageRating: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with auth token
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors
setupAxiosInterceptors(api);

export const reviewService = {
  // Create a new review
  createReview: async (reviewData: ReviewPayload): Promise<Review> => {
    const response = await api.post('/parking-reviews', reviewData);
    return response.data;
  },

  // Get reviews for a specific booking
  getReviewByBookingId: async (bookingId: string): Promise<Review | null> => {
    try {
      const response = await api.get(`/parking-reviews/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      // If no review found, return null
      return null;
    }
  },

  // Get all reviews for a parking location
  getReviewsByLocation: async (locationId: string): Promise<Review[]> => {
    const response = await api.get(`/parking-reviews/location/${locationId}`);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId: string, reviewData: Partial<ReviewPayload>): Promise<Review> => {
    const response = await api.put(`/parking-reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/parking-reviews/${reviewId}`);
  },

  // Get all reviews for a parking space with pagination
  getParkingSpaceReviews: async (parkingLocationId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> => {
    const response = await api.get(`/parking-reviews/space/${parkingLocationId}`, {
      params: { page, limit }
    });
    return response.data;
  },
}; 