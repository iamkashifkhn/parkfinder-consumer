"use client";

import { Card } from "@/components/ui/card";
import { Calendar, Clock, CreditCard, AlertTriangle } from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Cancellation Policy</h1>
        <p className="text-xl text-muted-foreground">
          Understanding our booking and cancellation guidelines
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <Card className="p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Free Cancellation Period</h3>
              <p className="text-muted-foreground">
                Most parking bookings can be cancelled free of charge up to 24 hours before your scheduled 
                arrival time. After this period, charges may apply as detailed below. Some premium locations 
                may have different cancellation windows which will be clearly displayed during booking.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Late Cancellations</h3>
              <p className="text-muted-foreground">
                Cancellations made less than 24 hours before the scheduled arrival time may be subject to a 
                50% cancellation fee. This fee compensates our parking partners who have reserved a space for you.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <AlertTriangle className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">No-Shows</h3>
              <p className="text-muted-foreground">
                If you do not arrive for your booking and have not cancelled in advance, this will be treated 
                as a no-show. No-shows are generally non-refundable and you will be charged the full booking amount.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <CreditCard className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Refund Processing</h3>
              <p className="text-muted-foreground">
                When a refund is due, it will be processed back to the original payment method within 5-10 business days, 
                depending on your payment provider. We cannot expedite this process as it depends on your bank or credit card company.
              </p>
            </div>
          </div>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          Last updated: June 2023
        </p>
      </div>
    </div>
  );
} 