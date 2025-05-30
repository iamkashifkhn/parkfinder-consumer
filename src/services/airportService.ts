import axios, { AxiosInstance } from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptors';

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

export interface Airport {
  id: string;
  name: string;
  city: string;
  cityCode: string;
  regionCode: string;
  regionName: string;
  countryCode: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateAirportDto {
  name: string;
  city: string;
  cityCode: string;
  regionCode: string;
  regionName: string;
  countryCode: string;
  countryName: string;
  continent: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface UpdateAirportDto extends Partial<CreateAirportDto> {
  id: string;
}

export interface AirportResponse {
  data: Airport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    appliedFilters: Record<string, any>;
  };
}

export interface GetAllAirportsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  name?: string;
}

// Search airports function
export async function searchAirports(query: string): Promise<AirportResponse> {
  try {
    const response = await publicApi.get<AirportResponse>('/airport', {
      params: {
        q: query,
        page: 1,
        limit: 10,
        status: 'ACTIVE',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching airports:', error);
    throw error;
  }
}

export const airportService = {
  // Get all airports
  getAll: async (params: GetAllAirportsParams = {}): Promise<AirportResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.name) {
      queryParams.append('name', params.name);
    }

    const response = await api.get<AirportResponse>(`/airport?${queryParams.toString()}`);
    return response.data;
  },

  // Get single airport
  getById: async (id: string): Promise<Airport> => {
    const response = await api.get(`/airport/${id}`);
    return response.data;
  },

  // Create new airport
  create: async (data: CreateAirportDto): Promise<Airport> => {
    const response = await api.post('/airport', data);
    return response.data;
  },

  // Update airport
  update: async (data: UpdateAirportDto): Promise<Airport> => {
    const response = await api.patch(`/airport/${data.id}`, data);
    return response.data;
  },

  // Delete airport
  delete: async (id: string): Promise<void> => {
    await api.delete(`/airport/${id}`);
  }
};