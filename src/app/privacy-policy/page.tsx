"use client";

import { Card } from "@/components/ui/card";
import { Shield, Eye, Lock, FileCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground">
          How we protect and manage your data at ParkFinder24
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-16">
        <Card className="p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Data Collection</h3>
              <p className="text-muted-foreground mb-4">
                We collect personal information that you voluntarily provide to us when you register on our platform, 
                express interest in obtaining information about us or our products, or otherwise contact us.
              </p>
              <p className="text-muted-foreground">
                The personal information we collect may include names, email addresses, phone numbers, 
                payment information, and vehicle details.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Data Security</h3>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures designed to protect 
                the security of any personal information we process. However, despite our safeguards, 
                no security system is impenetrable, and we cannot guarantee the security of our systems 100%.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 mb-6">
            <Eye className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Third-Party Disclosure</h3>
              <p className="text-muted-foreground">
                We may share your information with our parking partners to facilitate your booking. 
                We may also share information with service providers, business partners, 
                and other third parties to support our business operations.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <FileCheck className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Your Rights</h3>
              <p className="text-muted-foreground">
                Depending on your location, you may have rights regarding your personal information, 
                such as the right to access, correct, or delete the personal information we have collected about you.
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