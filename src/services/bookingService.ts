import axios, { AxiosInstance } from 'axios';
import { authService } from './authService';
import { setupAxiosInterceptors } from '../utils/axiosInterceptors';

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Vehicle {
  licensePlateNumber: string;
  makeAndModel: string;
  vehicleType: 'SEDAN' | 'SUV' | 'VAN' | 'TRUCK';
  numberOfPeople: number;
  features: string[];
}

export interface CreateBookingPayload {
  startTime: string;
  endTime: string;
  parkingLocationId: string;
  vehicles: Vehicle[];
  outboundFlightNumber: string;
  inboundFlightNumber: string;
  timezone: string;
}

export interface BookingResponse {
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface GetBookingsParams {
  searchQuery?: string;
  bookingStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: PaymentStatus;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface BookingVehicle {
  id: string;
  bookingId: string;
  licensePlateNumber: string;
  makeAndModel: string;
  vehicleType: string;
  numberOfPeople: number;
  features: {
    bookingVehicleId: string;
    featureId: string;
    featurePrice: string;
    feature: {
      name: string;
    };
  }[];
}

export interface Booking {
  id: string;
  bookingId: number;
  userId: string;
  parkingLocationId: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus?: PaymentStatus;
  totalAmount: string;
  parkingAmount: string;
  featuresAmount: string;
  cancellationReason: string | null;
  outboundFlightNumber: string;
  inboundFlightNumber: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  parkingLocation: {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string | null;
    street: string;
    streetNumber: string;
    latitude: number;
    longitude: number;
    placeId: string;
    googleMapsUrl: string;
    images: string[];
    parkingType: string;
    providerId: string;
    parkingTierId: string;
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  vehicles: BookingVehicle[];
  parkingPriceSegments?: Array<{
    id: string;
    bookingId: string;
    startTime: string;
    endTime: string;
    pricePerDay: string;
    createdAt: string;
    updatedAt: string;
  }>;
  auditLogs?: Array<{
    id: string;
    bookingId: string;
    actionType: string;
    performedById: string;
    performedByType: string;
    changes: Record<string, any>;
    createdAt: string;
  }>;
  payments?: Array<{
    id: string;
    bookingId: string;
    userId: string;
    amount: string;
    currency: string;
    status: string;
    paymentIntentId: string | null;
    paidAt: string | null;
    paymentMethod: string | null;
    transactionId: string | null;
    metadata: any | null;
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
    refunds?: Array<{
      id: string;
      paymentId: string;
      refundedById: string;
      amount: string;
      reason: string;
      status: string;
      stripeRefundId: string;
      completedAt: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
}

export interface ParkingAmountResponse {
  totalAmount: number;
  isAvailable: boolean,
  priceSegments: {
    startTime: string;
    endTime: string;
    pricePerDay: number;
  }[];
}

export interface PaymentIntentResponse {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_received: number;
  client_secret: string;
  currency: string;
  customer: string;
  description: string | null;
  metadata: {
    bookingId: string;
    userId: string;
  };
  payment_method: string | null;
  status: string;
  // Other fields omitted for brevity
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

export const bookingService = {
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    try {
      const response = await api.post('/bookings', payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create booking');
      }
      throw error;
    }
  },

  getPaymentIntentSecret: async (paymentIntentId: string): Promise<PaymentIntentResponse> => {
    try {
      const response = await api.get<PaymentIntentResponse>(`/payments/intent/${paymentIntentId}`);
      console.log("Payment intent secret:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get payment intent secret');
      }
      throw error;
    }
  },

  getBookings: async (params: GetBookingsParams = {}): Promise<BookingResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.searchQuery) {
        queryParams.append('searchQuery', params.searchQuery);
      }
      if (params.bookingStatus) {
        queryParams.append('bookingStatus', params.bookingStatus);
      }
      if (params.paymentStatus) {
        queryParams.append('paymentStatus', params.paymentStatus);
      }
      if (params.userId) {
        queryParams.append('userId', params.userId);
      }
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const response = await api.get<BookingResponse>(`/bookings?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
      }
      throw error;
    }
  },

  getBookingById: async (id: string): Promise<Booking> => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch booking');
      }
      throw error;
    }
  },

  cancelBooking: async (id: string, reason: string): Promise<Booking> => {
    try {
      const response = await api.delete(`/bookings/${id}`, {
        params: { reason }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to cancel booking');
      }
      throw error;
    }
  },

  getParkingAmount: async (id: string, timezone: string, startAt: string, endAt: string): Promise<ParkingAmountResponse> => {
    try {
      const response = await api.get<ParkingAmountResponse>(`/parking/space/amount/${id}`, {
        params: {
          timezone,
          startAt,
          endAt,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch parking amount');
      }
      throw error;
    }
  },
}; 