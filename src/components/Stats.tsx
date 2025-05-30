"use client";

export function Stats() {
  const stats = [
    {
      number: "15K+",
      label: "Completed Bookings",
      description: "Successfully managed parking reservations with seamless airport transfers"
    },
    {
      number: "10+",
      label: "Airport Locations",
      description: "Serving major airports across Germany with convenient parking solutions"
    },
    {
      number: "52+",
      label: "Security Staff",
      description: "Professional team ensuring 24/7 surveillance and vehicle protection"
    },
    {
      number: "16K+",
      label: "Happy Customers",
      description: "Trusted by thousands of travelers for reliable airport parking services"
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="text-center"
        >
          <div className="text-[40px] font-medium text-blue-600 leading-none mb-4">
            {stat.number}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {stat.label}
          </h3>
          <p className="text-sm text-gray-600 max-w-[280px] mx-auto leading-relaxed">
            {stat.description}
          </p>
        </div>
      ))}
    </>
  );
} 