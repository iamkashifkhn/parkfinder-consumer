import axios, { AxiosInstance } from 'axios';
import { setupAxiosInterceptors } from '../utils/axiosInterceptors';

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

export const uploadService = {
  // Upload multiple files
  uploadFiles: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    
    // Append all files
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Append file URLs if needed
    const fileUrls = files.map(file => URL.createObjectURL(file));
    formData.append('filesUrls', JSON.stringify(fileUrls));

    const response = await api.post<string[]>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
}; 