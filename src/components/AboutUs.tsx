import { Stats } from "./Stats";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";



export function AboutUs() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative">
         

          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src="/images/about-us.jpg"
              alt="About Us Photo"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>
        
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gray-400">Your Trusted </span><br />
              <span className="text-gray-900">Partner for  </span><br />
              <span className="text-blue-600"> Airport</span>{" "}
              <span className="text-gray-900">Parking</span>
            </h2>
            <p className="text-lg text-gray-600">
              Since 2015, we&apos;ve been revolutionizing airport parking by making it simple, 
              secure, and affordable. Our commitment to excellence and customer satisfaction 
              has made us the trusted choice for travelers.
            </p>
          </div>

          <div className="flex gap-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
       <Stats />
      </div>
    </div>
  );
} 