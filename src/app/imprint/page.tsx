"use client";

import { Card } from "@/components/ui/card";
import { Building, MapPin, Mail, Phone } from "lucide-react";

export default function ImprintPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Imprint</h1>
        <p className="text-xl text-muted-foreground">
          Legal information about our company
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <Card className="p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <Building className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Company Information</h3>
              <p className="text-muted-foreground mb-4">
                ParkFinder24 GmbH<br />
                Registration Number: HRB 123456<br />
                VAT ID: DE123456789
              </p>
              <p className="text-muted-foreground">
                Managing Directors: Jane Doe, John Smith
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <MapPin className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Registered Office</h3>
              <p className="text-muted-foreground">
                Parking Street 123<br />
                10115 Berlin<br />
                Germany
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <Mail className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Contact Email</h3>
              <p className="text-muted-foreground">
                General Inquiries: info@parkfinder24.com<br />
                Support: support@parkfinder24.com<br />
                Press: press@parkfinder24.com
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Phone className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-muted-foreground">
                Customer Service: +49 30 1234567<br />
                Operating hours: Monday to Friday, 9:00 AM - 6:00 PM CET
              </p>
            </div>
          </div>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          Responsible for content according to § 55 RStV: Jane Doe, ParkFinder24 GmbH
        </p>
      </div>
    </div>
  );
} 