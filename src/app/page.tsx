import Image from "next/image";
import { SearchForm } from "@/components/SearchForm";
import { PopularLocations } from "../components/PopularLocations";
import { HowItWorks } from "../components/HowItWorks";
import { Reviews } from "../components/Reviews";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { SEOContent } from "../components/SEOContent";
import { AboutUs } from "../components/AboutUs";

import { Help } from "@/app/help/page";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[65vh] pt-20 bg-blue-600 flex items-center">
        <Image
          src="/images/bg-pattern.png"
          alt="Airport Parking"
          fill
          className="object-cover opacity-15"
        />
        <div className="absolute" />

        <div className="relative h-full max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-20">
          <div className="text-left space-y-6">
            <h1 className="text-5xl md:text-5xl font-bold text-white animate-fade-in">
              Find & Book Parking
            </h1>

            <p className="text-xl md:text-1xl text-white/90 max-w-2xl animate-fade-in-up">
              Compare prices at over 500 parking locations worldwide. Save up to 60% on airport parking today.
            </p>

            <div className="w-full max-w-4xl animate-fade-in-up delay-200">
              <SearchForm />
            </div>

            <div className="text-white/80">
              <p className="text-sm mb-3">Popular Airports:</p>
              <div className="flex flex-wrap gap-4">
                {["Frankfurt", "Munich", "Berlin", "Hamburg"].map((airport) => (
                  <button
                    key={airport}
                    className="px-4 py-2 rounded-full  bg-blue-300 hover:bg-blue-400
                             transition-colors text-sm text-blue-900"
                  >
                    {airport} Airport
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block animate-fade-in-up delay-200" aria-hidden="true">
            <Image
              src="/images/woman-driving-car.webp"
              alt="Airport Parking"
              width={600}
              height={400}
              className="rounded-lg w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold  mx-auto text-center">
              <span className="text-gray-700">How its</span>
              <span className="text-blue-600"> Work</span>
            </h2>
          <HowItWorks />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold  mx-auto text-center mb-12">
              <span className="text-gray-700">Why Choose</span>
              <span className="text-blue-600"> Us?</span>
            </h2>
          <WhyChooseUs />
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold  mx-auto text-center mb-12">
              <span className="text-gray-700">Discover the Best Airport Parking Options</span>
              <span className="text-blue-600"> Near You</span>
            </h2>
          <SEOContent />
        </div>
      </section>

     

      {/* Customer Reviews */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold  mx-auto text-center mb-12">
            <span className="text-gray-700">What Our</span>
            <span className="text-blue-600"> Customers Say</span>
          </h2>
          <Reviews />
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold  mx-auto text-center mb-12">
            <span className="text-gray-700">Popular</span>
            <span className="text-blue-600"> Parking Locations</span>
          </h2>
          <PopularLocations />
        </div>
      </section>
       {/* About Us */}
       <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          
          <AboutUs />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <Help />
        </div>
      </section>
      
    </div>
  );
}