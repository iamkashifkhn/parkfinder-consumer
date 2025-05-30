"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface FormData {
  fullName: string;
  companyName: string;
  website: string;
  companyAddress: string;
  parkingLocation: string;
  phoneNumber: string;
  email: string;
  description: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://parkfinder-backend-piinu.ondigitalocean.app";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data', // This default will be overridden when needed
  },
});

// Error message mapping
const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Our server is experiencing issues. Please try again later.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  DEFAULT: "An unexpected error occurred. Please try again."
};

// Handle API errors
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    
    // Network error
    if (!axiosError.response) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      return;
    }

    // Get the status code
    const status = axiosError.response.status;
    const serverMessage = axiosError.response.data?.message;

    // Handle different status codes
    switch (status) {
      case 400:
        toast.error(serverMessage || ERROR_MESSAGES.VALIDATION_ERROR);
        break;
      case 401:
      case 403:
        toast.error("You are not authorized to perform this action.");
        break;
      case 404:
        toast.error("The registration service is currently unavailable.");
        break;
      case 422:
        toast.error(serverMessage || "Invalid input data. Please check your form.");
        break;
      case 429:
        toast.error("Too many requests. Please try again later.");
        break;
      case 500:
      case 502:
      case 503:
        toast.error(ERROR_MESSAGES.SERVER_ERROR);
        break;
      default:
        toast.error(serverMessage || ERROR_MESSAGES.DEFAULT);
    }

    // Log the error for debugging
    console.error('Registration error:', {
      status,
      message: serverMessage,
      error: axiosError
    });
  } else {
    // Handle non-Axios errors
    toast.error(ERROR_MESSAGES.DEFAULT);
    console.error('Non-Axios error:', error);
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    companyName: "",
    website: "",
    companyAddress: "",
    parkingLocation: "",
    phoneNumber: "",
    email: "",
    description: "",
  });

  // Cleanup function for file previews
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => {
        if (file.type.startsWith('image/')) {
          return Object.assign(file, {
            preview: URL.createObjectURL(file)
          });
        }
        return file;
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const file = newFiles[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate file size and type before uploading
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      const invalidFiles = files.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File ${file.name} exceeds 5MB size limit`);
          return true;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`File ${file.name} has unsupported format`);
          return true;
        }
        return false;
      });

      if (invalidFiles.length > 0) {
        return;
      }

      // Create FormData instance for multipart/form-data submission
      const submitFormData = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value.toString());
      });

      // Append all files with the key 'registrationDocuments'
      files.forEach((file) => {
        submitFormData.append('registrationDocuments', file);
      });

      // Debug log to verify FormData contents
      console.log('Form Data Contents:');
      Array.from(submitFormData.keys()).forEach(key => {
        if (key === 'registrationDocuments') {
          const documents = submitFormData.getAll('registrationDocuments');
          console.log('registrationDocuments:', documents);
        } else {
          console.log(key, submitFormData.get(key));
        }
      });

      // Send the registration request using axios with FormData
      const response = await api.post('/registration-requests', submitFormData);

      // Reset form and files
      setFormData({
        fullName: "",
        companyName: "",
        website: "",
        companyAddress: "",
        parkingLocation: "",
        phoneNumber: "",
        email: "",
        description: "",
      });
      setFiles([]);

      toast.success("Registration request submitted successfully!");
      router.push('/business/success');
      
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Partner Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name of Responsible Person</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="+92 XXX XXXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                placeholder="Your Company Ltd."
              />
            </div>

            <div>
              <Label htmlFor="website">Company Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                required
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <Label htmlFor="companyAddress">Company Address</Label>
              <Input
                id="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                required
                placeholder="Complete company address"
              />
            </div>

            <div>
              <Label htmlFor="parkingLocation">Parking Location</Label>
              <Input
                id="parkingLocation"
                value={formData.parkingLocation}
                onChange={handleInputChange}
                required
                placeholder="Parking facility location"
              />
            </div>

            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Tell us about your parking facility..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="documents">Documents</Label>
              <div className="mt-2 space-y-4">
                <Input
                  id="documents"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-muted-foreground">
                  Upload business registration, licenses, or any other relevant documents (Max 5MB per file)
                </p>
                {files.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative group border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                              <span className="text-xs text-slate-500">
                                {file.name.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </Card>
    </div>
  );
} 