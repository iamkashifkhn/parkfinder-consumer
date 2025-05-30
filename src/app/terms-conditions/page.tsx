"use client";

import { Card } from "@/components/ui/card";
import { FileText, AlertCircle, Receipt, Scale } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-xl text-muted-foreground">
          Please read these terms carefully before using our services
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <Card className="p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Service Agreement</h3>
              <p className="text-muted-foreground mb-4">
                By using our platform, you agree to these Terms and Conditions. We provide a platform 
                to connect travelers with parking facilities. We are not responsible for the services provided 
                by individual parking facilities.
              </p>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. Your continued use of our services 
                after any changes constitutes your acceptance of the revised Terms.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <Receipt className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Payments & Refunds</h3>
              <p className="text-muted-foreground">
                All payments are processed securely through our platform. Refunds are subject to the 
                cancellation policy of the specific parking service you have booked. We act as a payment 
                processor and do not directly handle refunds, which are subject to the policies of our partners.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <AlertCircle className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Limitation of Liability</h3>
              <p className="text-muted-foreground">
                We are not responsible for damages, losses, or injuries that may occur while using parking services 
                booked through our platform. Our liability is limited to the amount paid for the booking through our platform.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Scale className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Dispute Resolution</h3>
              <p className="text-muted-foreground">
                Any disputes regarding bookings should first be addressed with the parking service provider. 
                If the issue cannot be resolved, our customer service team will assist in finding a resolution 
                according to our mediation policies.
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