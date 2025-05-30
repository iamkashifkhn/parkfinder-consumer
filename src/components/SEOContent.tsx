import Link from "next/link";

const popularAirports = [
  { name: "Frankfurt", slug: "frankfurt-airport" },
  { name: "Munich", slug: "munich-airport" },
  { name: "Berlin", slug: "berlin-airport" },
  { name: "Hamburg", slug: "hamburg-airport" },
];

export function SEOContent() {
  return (
    
    <div className="prose prose-lg mx-auto max-w-4xl">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Find Affordable Airport Parking Solutions
          </h3>
          <p className="text-gray-600 mb-4">
            Looking for convenient and cheap airport parking? Our platform connects you with secure parking 
            facilities near major airports across Germany. Whether you need short-term or long-term parking, 
            we offer competitive rates and guaranteed spots at all major airports.
          </p>
        </div>

        <div>
          <h4 className="text-xl font-medium text-gray-900 mb-3">
            Secure Parking at Major Airports
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {popularAirports.map((airport) => (
              <Link
                key={airport.slug}
                href={`/parking/${airport.slug}`}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-primary">Find parking at {airport.name} Airport</span>
                <span className="ml-2 text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-medium text-gray-900 mb-3">
            Why Choose Airport Parking With Us?
          </h4>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Save up to 70% on long-term airport parking</li>
            <li>All parking facilities are security monitored 24/7</li>
            <li>Free cancellation up to 24 hours before your booking</li>
            <li>Regular shuttle service to and from the terminal</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-xl font-medium text-gray-900 mb-3">
            Long-Term Airport Parking Made Easy
          </h4>
          <p className="text-gray-600">
            Planning an extended trip? Our long-term parking options offer the best value for your money. 
            With rates starting as low as €5 per day, secure your spot in advance and enjoy peace of mind 
            knowing your vehicle is in safe hands while you travel.
          </p>
        </div>
      </div>
    </div>
  );
} 