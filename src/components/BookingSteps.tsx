import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStepsProps {
  currentStep: number;
}

export const BookingSteps = ({ currentStep }: BookingStepsProps) => {
  const steps = [
    { id: 1, name: 'Details' },
    { id: 2, name: 'Payment' },
    { id: 3, name: 'Confirmation' }
  ];

  return (
    <div className="flex justify-center">
      <nav className="flex items-center space-x-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full
              ${currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {step.id}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900">{step.name}</span>
            {step.id < steps.length && (
              <div className="ml-4 w-8 h-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}; 