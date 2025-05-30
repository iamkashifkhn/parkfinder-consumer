"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Paperclip, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { authService } from "@/services/authService";
import type { User } from "@/types/user";

// Define the support request interface without messages
interface SupportRequest {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: "pending" | "in_progress" | "resolved" | "cancelled";
  createdAt: string;
  attachments: string[];
  lastUpdated?: string;
}

export default function SupportRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [supportRequest, setSupportRequest] = useState<SupportRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // If not a consumer/customer, redirect to home
    if (user && user.role !== 'consumer') {
      router.push('/');
      return;
    }

    // Fetch the support request by ID
    // This would be an API call in a real app
    const fetchSupportRequest = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data for this example
      if (requestId === "SR001") {
        setSupportRequest({
          id: "SR001",
          subject: "Parking Spot Reservation Issue",
          description: "I'm having trouble reserving a parking spot for next week. The system shows availability but gives an error when I try to complete the booking.",
          category: "booking",
          status: "pending",
          createdAt: "2024-03-15T10:30:00Z",
          attachments: ["screenshot1.jpg"],
          lastUpdated: "2024-03-15T10:30:00Z"
        });
      } else if (requestId === "SR002") {
        setSupportRequest({
          id: "SR002",
          subject: "Payment Not Processed",
          description: "I made a payment for my monthly parking subscription but it's still showing as unpaid in my account.",
          category: "payment",
          status: "in_progress",
          createdAt: "2024-03-14T14:45:00Z",
          attachments: ["payment_receipt.pdf", "account_screenshot.jpg"],
          lastUpdated: "2024-03-14T16:15:00Z"
        });
      } else if (requestId === "SR003") {
        setSupportRequest({
          id: "SR003",
          subject: "Request for Refund",
          description: "I accidentally booked two parking spots for the same time period. I need a refund for one of the bookings.",
          category: "payment",
          status: "resolved",
          createdAt: "2024-03-13T09:15:00Z",
          attachments: ["booking_confirmation.pdf"],
          lastUpdated: "2024-03-13T11:30:00Z"
        });
      } else {
        // Handle case when request ID is not found
        router.push('/account/support-requests');
      }
      
      setIsLoading(false);
    };

    fetchSupportRequest();
  }, [requestId, router]);

  // Get status badge based on status
  const getStatusBadge = (status: SupportRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading request details...</span>
        </div>
      </div>
    );
  }

  if (!supportRequest) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Support Request Not Found</h2>
          <p className="text-muted-foreground mb-4">The support request you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/account/support-requests">Back to Support Requests</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl">
      <Link href="/account/support-requests" className="flex items-center text-sm text-muted-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Support Requests
      </Link>
      
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold">{supportRequest.subject}</h1>
          <div className="flex items-center gap-3">
            {getStatusBadge(supportRequest.status)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-medium">Request ID:</span> {supportRequest.id}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-medium">Category:</span> {supportRequest.category}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Submitted:</span> {format(new Date(supportRequest.createdAt), 'MMM d, yyyy')}
          </div>
          {supportRequest.lastUpdated && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">Last Updated:</span> {format(new Date(supportRequest.lastUpdated), 'MMM d, yyyy')}
            </div>
          )}
        </div>
        
        <div className="border-t pt-4 mb-4">
          <h2 className="font-medium mb-2">Description</h2>
          <p className="text-gray-700">{supportRequest.description}</p>
        </div>
        
        {supportRequest.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h2 className="font-medium mb-2 flex items-center">
              <Paperclip className="h-4 w-4 mr-1" />
              Attachments ({supportRequest.attachments.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {supportRequest.attachments.map((file, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1 bg-gray-50">
                  {file}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium mb-2">Status Information</h2>
        {supportRequest.status === "pending" && (
          <p className="text-sm text-muted-foreground">
            Your support request has been received and is waiting to be reviewed by our team. 
            We'll respond as soon as possible.
          </p>
        )}
        {supportRequest.status === "in_progress" && (
          <p className="text-sm text-muted-foreground">
            Our team is currently working on your request. 
            You'll receive updates via email as we make progress.
          </p>
        )}
        {supportRequest.status === "resolved" && (
          <p className="text-sm text-muted-foreground">
            This support request has been resolved. If you're still experiencing issues,
            please submit a new request or contact our support team.
          </p>
        )}
        {supportRequest.status === "cancelled" && (
          <p className="text-sm text-muted-foreground">
            This support request has been cancelled. If you need further assistance,
            please submit a new request.
          </p>
        )}
      </div>
      
      <div className="flex gap-4">
        <Button 
          asChild
          variant="outline"
        >
          <Link href="/account/support-requests">
            Back to All Requests
          </Link>
        </Button>
        
        {supportRequest.status !== "resolved" && supportRequest.status !== "cancelled" && (
          <Button 
            asChild
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Link href={`/account/support-requests?cancel=${supportRequest.id}`}>
              Cancel Request
            </Link>
          </Button>
        )}
        
        <Button
          asChild
          className="ml-auto"
        >
          <Link href="/contact">
            New Support Request
          </Link>
        </Button>
      </div>
    </div>
  );
} 