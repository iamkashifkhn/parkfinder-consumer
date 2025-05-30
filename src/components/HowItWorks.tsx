import { Search, Compass, Calendar } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search for airport parking",
    
  },
  {
    icon: Compass,
    title: "Compare prices and choose",
    
  },
  {
    icon: Calendar,
    title: "Book online in minutes",
    
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100"
            >
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl bg-blue-50 flex items-center justify-center text-primary text-4xl">
                    {`0${index + 1}`}
                  </div>
                </div>
                <div className="flex-row gap-4">
                  <step.icon className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                </div>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
} 