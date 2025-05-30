"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Search, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { authService } from "@/services/authService";
import type { User } from "@/types/user";

// Define the support request interface
interface SupportRequest {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: "pending" | "in_progress" | "resolved" | "cancelled";
  createdAt: string;
  attachments: string[];
}

export default function CustomerSupportRequestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Load user from localStorage on component mount
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    // If not a consumer/customer, redirect to home
    if (user && user.role !== "consumer") {
      router.push("/");
    }
  }, [router]);

  // Sample support requests data - in a real app, this would be fetched from an API
  // and filtered by the current user's ID
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([
    {
      id: "SR001",
      subject: "Parking Spot Reservation Issue",
      description:
        "I'm having trouble reserving a parking spot for next week. The system shows availability but gives an error when I try to complete the booking.",
      category: "booking",
      status: "pending",
      createdAt: "2024-03-15T10:30:00Z",
      attachments: ["screenshot1.jpg"],
    },
    {
      id: "SR002",
      subject: "Payment Not Processed",
      description:
        "I made a payment for my monthly parking subscription but it's still showing as unpaid in my account.",
      category: "payment",
      status: "in_progress",
      createdAt: "2024-03-14T14:45:00Z",
      attachments: ["payment_receipt.pdf", "account_screenshot.jpg"],
    },
    {
      id: "SR003",
      subject: "Request for Refund",
      description:
        "I accidentally booked two parking spots for the same time period. I need a refund for one of the bookings.",
      category: "payment",
      status: "resolved",
      createdAt: "2024-03-13T09:15:00Z",
      attachments: ["booking_confirmation.pdf"],
    },
  ]);

  // Filter support requests based on search query and status
  const filteredRequests = supportRequests.filter((request) => {
    const matchesSearch =
      request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge based on status
  const getStatusBadge = (status: SupportRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Resolved
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Support Requests</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your support tickets
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search requests..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => router.push("/contact")}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">No support requests found</p>
              <p className="text-sm text-muted-foreground mt-1">
                You haven't submitted any support requests yet.
              </p>
              <Button
                className="mt-4"
                variant="default"
                onClick={() => router.push("/contact")}
              >
                Submit a Request
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      Request ID
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      Subject
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium">{request.id}</td>
                      <td className="p-3 text-sm">{request.subject}</td>
                      <td className="p-3 text-sm">
                        <div
                          className="max-w-[350px] truncate"
                          title={request.description}
                        >
                          {request.description}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="p-3 text-sm">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="p-3 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() =>
                            router.push(
                              `/account/support-requests/${request.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
