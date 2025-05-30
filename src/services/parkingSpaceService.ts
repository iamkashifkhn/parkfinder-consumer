import axios, { AxiosInstance, AxiosError } from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptors';
import { Review } from './reviewService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://parkfinder-backend-piinu.ondigitalocean.app";

// Create axios instance with auth token
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a public axios instance without token
const publicApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors for authenticated api instance
setupAxiosInterceptors(api);

export interface Feature {
  id: string;
  name: string;
  price: string;
  isFree: boolean;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ParkingTier {
  id: string;
  name: string;
  pricePerDay: string;
  icon: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Provider {
  id: string;
  userId: string;
  companyName: string;
  companyAddress: string;
  taxId: string;
  description: string;
  website: string;
  isApproved: boolean;
  registrationDocuments: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ParkingSpace {
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
  providerId: string;
  parkingTierId: string;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  provider: Provider;
  parkingTier: ParkingTier;
  features: Feature[];
  bookings: unknown[];
  distanceKm?: number;
  reviews: Review[];  
}

export interface ParkingSpaceCreateData {
  name: string;
  description: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  street: string;
  streetNumber: string;
  latitude: number;
  longitude: number;
  placeId: string;
  googleMapsUrl?: string;
  parkingTierId: string;
  totalSlots: number;
  availableSlots: number;
  bookedSlots?: number;
  features?: string[];
}

export interface ParkingSpaceUpdateData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  street?: string;
  streetNumber?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  googleMapsUrl?: string;
  parkingTierId?: string;
  totalSlots?: number;
  availableSlots?: number;
  bookedSlots?: number;
  features?: string[];
}

interface ErrorResponse {
  message: string;
}

export const parkingSpaceService = {
  getAllParkingSpaces: async (): Promise<ParkingSpace[]> => {
    try {
      const response = await api.get<{ data: ParkingSpace[] }>('/parking/space/me');
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
      throw error;
    }
  },

  getParkingSpaceById: async (id: string): Promise<ParkingSpace> => {
    try {
      const response = await api.get<ParkingSpace>(`/parking/space/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching parking space:', error);
      throw error;
    }
  },

  createParkingSpace: async (formData: FormData): Promise<ParkingSpace> => {
    try {
      const response = await api.post<ParkingSpace>('/parking/space', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating parking space:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        throw new Error(axiosError.response?.data?.message || 'Failed to create parking space');
      }
      throw error;
    }
  },

  deleteParkingSpace: async (id: string): Promise<void> => {
    try {
      await api.delete(`/parking/space/${id}`);
    } catch (error) {
      console.error('Error deleting parking space:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        throw new Error(axiosError.response?.data?.message || 'Failed to delete parking space');
      }
      throw error;
    }
  },

  updateParkingSpace: async (id: string, data: ParkingSpaceUpdateData): Promise<ParkingSpace> => {
    try {
      const response = await api.patch<ParkingSpace>(`/parking/space/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating parking space:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        throw new Error(axiosError.response?.data?.message || 'Failed to update parking space');
      }
      throw error;
    }
  },

  updateParkingSpaceImages: async (id: string, formData: FormData): Promise<ParkingSpace> => {
    try {
      const response = await api.patch<ParkingSpace>(`/parking/space/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating parking space images:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        throw new Error(axiosError.response?.data?.message || 'Failed to update parking space images');
      }
      throw error;
    }
  }
}; 

interface SearchQueryParams {
  airportLat?: number;
  airportLng?: number;
  maxDistanceKm?: number;
  timezone?: string;
}

export const publicParkingService = {
  getAllPublicParkingSpaces: async (params: SearchQueryParams): Promise<ParkingSpace[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.airportLat) {
        queryParams.append('airportLat', params.airportLat.toString());
      }
      if (params.airportLng) {
        queryParams.append('airportLng', params.airportLng.toString());
      }
      if (params.timezone) {
        queryParams.append('timezone', params.timezone);
      }
      queryParams.append('maxDistanceKm', (params.maxDistanceKm ?? 10).toString());

      const response = await publicApi.get<{ data: ParkingSpace[] }>(`/parking/space?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
      throw error;
    }
  },

  getPublicParkingSpaceById: async (id: string): Promise<ParkingSpace | null> => {
    try {
      const response = await publicApi.get<ParkingSpace>(`/parking/space/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public parking space by ID:', error);
      return null;
    }
  },
};