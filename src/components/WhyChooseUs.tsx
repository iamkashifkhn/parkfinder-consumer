import { CheckCircle, Banknote, CalendarX, RefreshCw } from "lucide-react";

const benefits = [
  {
    icon: CheckCircle,
    title: "Carefully Checked",
    description: "All parking locations are thoroughly inspected.",
  },
  {
    icon: Banknote,
    title: "The Best Deals",
    description: "The best offers for airport parking.",
  },
  {
    icon: CalendarX,
    title: "Free Cancellation",
    description: "Free cancellation up to 24 hours before your booking.",
  },
  {
    icon: RefreshCw,
    title: "Maximum Availability",
    description: "Through direct booking with the parking provider.",
  },
];

export function WhyChooseUs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {benefits.map((benefit, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <benefit.icon className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {benefit.title}
          </h3>
          <p className="text-sm text-gray-500">
            {benefit.description}
          </p>
        </div>
      ))}
    </div>
  );
} 