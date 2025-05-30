"use client";

import { Card } from "@/components/ui/card";
import { Car, Users, Globe, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">About Smart Parking</h1>
        <p className="text-xl text-muted-foreground">
          Making airport parking simple, secure, and stress-free since 2020.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Car className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                To simplify airport parking by connecting travelers with secure, convenient, and affordable parking options.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Our Team</h3>
              <p className="text-muted-foreground">
                A dedicated team of parking experts and tech enthusiasts working to revolutionize airport parking.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Globe className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Global Presence</h3>
              <p className="text-muted-foreground">
                Operating at major airports worldwide with a network of trusted parking partners.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <Award className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Our Values</h3>
              <p className="text-muted-foreground">
                Committed to transparency, security, and exceptional customer service.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}