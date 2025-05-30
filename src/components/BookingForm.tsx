"use client";

import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Plus, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services/authService";
import { useBookingStore } from "@/store/bookingStore";
import { CurrencySymbol } from "./CurrencySymbol";
import { bookingService } from "@/services/bookingService";

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  makeAndModel: string;
  vehicleType: string;
  numberOfPeople: string;
}

interface BookingFormProps {
  parkingId: string;
  startDate?: string;
  endDate?: string;
  additionalServices: AdditionalService[];
  selectedServiceIds: string[];
  onServiceChange: Dispatch<SetStateAction<string[]>>;
  flightInfoRequired?: boolean;
}

export const BookingForm = ({
  parkingId,
  startDate,
  endDate,
  additionalServices,
  selectedServiceIds,
  onServiceChange,
  flightInfoRequired = false
}: BookingFormProps) => {
  const router = useRouter();
  const { setBookingDetails } = useBookingStore();
  const [outboundFlight, setOutboundFlight] = useState("");
  const [inboundFlight, setInboundFlight] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: crypto.randomUUID(),
      licensePlate: "",
      makeAndModel: "",
      vehicleType: "",
      numberOfPeople: ""
    }
  ]);
  const [baseAmount, setBaseAmount] = useState<number | null>(null);

  // Fetch base amount when dates change
  useEffect(() => {
    const fetchBaseAmount = async () => {
      if (!startDate || !endDate) return;
      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await bookingService.getParkingAmount(parkingId, userTimezone, startDate, endDate);
        setBaseAmount(response.totalAmount);
        // Update booking store with the base amount
        setBookingDetails({
          parkingId,
          startDate,
          endDate,
          amount: response.totalAmount,
        });
      } catch (error) {
        console.error('Error fetching parking amount:', error);
      }
    };

    fetchBaseAmount();
  }, [parkingId, startDate, endDate]);

  // Update amount when vehicles change
  useEffect(() => {
    if (baseAmount !== null) {
      const vehicleMultiplier = vehicles.length;
      const baseParkingAmount = baseAmount;
      const additionalServicesAmount = additionalServices
        .filter(service => selectedServiceIds.includes(service.id))
        .reduce((total, service) => total + service.price, 0);
      
      // Apply vehicle multiplier to both base amount and additional services
      const newAmount = (baseParkingAmount + additionalServicesAmount) * vehicleMultiplier;
      
      setBookingDetails({
        amount: newAmount,
        baseParkingAmount,
        additionalServicesAmount,
        vehicleMultiplier,
      });
    }
  }, [vehicles.length, baseAmount, selectedServiceIds, additionalServices]);

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      onServiceChange(prev => [...prev, serviceId]);
    } else {
      onServiceChange(prev => prev.filter(id => id !== serviceId));
    }
  };

  const handleVehicleChange = (id: string, field: keyof Vehicle, value: string) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, [field]: value } : vehicle
    ));
  };

  const addVehicle = () => {
    setVehicles([...vehicles, {
      id: crypto.randomUUID(),
      licensePlate: "",
      makeAndModel: "",
      vehicleType: "",
      numberOfPeople: ""
    }]);
  };

  const removeVehicle = (id: string) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Add selected services to form data
    selectedServiceIds.forEach(serviceId => {
      formData.append('services[]', serviceId);
    });
    
    // Get flight information
    const outbound = formData.get('outboundFlight')?.toString() || '';
    const inbound = formData.get('inboundFlight')?.toString() || '';
    
    // Check if flight info is required but not provided
    if (flightInfoRequired && (!outbound || !inbound)) {
      // Handle validation error - flight info is required
      alert("Please provide both outbound and inbound flight numbers.");
      return;
    }

    // Validate vehicles data
    if (vehicles.some(v => !v.licensePlate || !v.makeAndModel || !v.vehicleType)) {
      alert("Please complete all vehicle details.");
      return;
    }

    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    
    // Save booking details to Zustand store
    setBookingDetails({
      parkingId,
      startDate,
      endDate,
      selectedServices: selectedServiceIds,
      additionalServices: additionalServices.filter(service => selectedServiceIds.includes(service.id)),
      outboundFlight: outbound,
      inboundFlight: inbound,
      vehicles,
    });

    // Construct the payment URL with all parameters
    const paymentUrl = `/booking/${parkingId}/payment?` + 
      `start=${startDate}&end=${endDate}` + 
      `&services=${selectedServiceIds.join(',')}` + 
      `&outbound=${encodeURIComponent(outbound)}` + 
      `&inbound=${encodeURIComponent(inbound)}` +
      `&vehicles=${encodeURIComponent(JSON.stringify(vehicles))}`;

    if (!currentUser) {
      // User is not logged in, redirect to login page with return URL
      router.push(`/auth/consumer/login?returnUrl=${encodeURIComponent(paymentUrl)}`);
      return;
    }

    // User is logged in, proceed to payment
    router.push(paymentUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Booking Details</h2>
      
      <div className="space-y-6">
        {/* Vehicle Information Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">Vehicle Information</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>You can add multiple vehicles under this reservation. All details are required for each vehicle.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {vehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="mb-6 p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Vehicle {index + 1}</h4>
                {vehicles.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeVehicle(vehicle.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`licensePlate-${vehicle.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate Number
                  </label>
                  <Input
                    type="text"
                    id={`licensePlate-${vehicle.id}`}
                    value={vehicle.licensePlate}
                    onChange={(e) => handleVehicleChange(vehicle.id, 'licensePlate', e.target.value)}
                    required
                    placeholder="AB123CD"
                  />
                </div>

                <div>
                  <label htmlFor={`makeAndModel-${vehicle.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Make & Model
                  </label>
                  <Input
                    type="text"
                    id={`makeAndModel-${vehicle.id}`}
                    value={vehicle.makeAndModel}
                    onChange={(e) => handleVehicleChange(vehicle.id, 'makeAndModel', e.target.value)}
                    required
                    placeholder="e.g., Toyota Camry"
                  />
                </div>

                <div>
                  <label htmlFor={`vehicleType-${vehicle.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <Select
                    value={vehicle.vehicleType}
                    onValueChange={(value) => handleVehicleChange(vehicle.id, 'vehicleType', value)}
                    required
                  >
                    <SelectTrigger id={`vehicleType-${vehicle.id}`}>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor={`numberOfPeople-${vehicle.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Number of People
                  </label>
                  <Input
                    type="number"
                    id={`numberOfPeople-${vehicle.id}`}
                    value={vehicle.numberOfPeople}
                    onChange={(e) => handleVehicleChange(vehicle.id, 'numberOfPeople', e.target.value)}
                    required
                    min="1"
                    max="10"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button 
            type="button" 
            variant="outline" 
            onClick={addVehicle}
            className="w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Vehicle
          </Button>
        </div>

        {/* Flight Information Section */}
        <div className="pt-6 border-t">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-medium">Flight Information</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Providing your flight details helps the parking provider track your arrival and departure for better service coordination.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="outboundFlight" className="block text-sm font-medium text-gray-700 mb-1">
                Outbound Flight Number {flightInfoRequired && <span className="text-red-500">*</span>}
                <span className="text-sm text-gray-500 ml-1">(When departing)</span>
              </label>
              <Input
                type="text"
                id="outboundFlight"
                name="outboundFlight"
                value={outboundFlight}
                onChange={(e) => setOutboundFlight(e.target.value)}
                required={flightInfoRequired}
                placeholder="e.g., LH1234"
              />
            </div>

            <div>
              <label htmlFor="inboundFlight" className="block text-sm font-medium text-gray-700 mb-1">
                Inbound Flight Number {flightInfoRequired && <span className="text-red-500">*</span>}
                <span className="text-sm text-gray-500 ml-1">(When returning)</span>
              </label>
              <Input
                type="text"
                id="inboundFlight"
                name="inboundFlight"
                value={inboundFlight}
                onChange={(e) => setInboundFlight(e.target.value)}
                required={flightInfoRequired}
                placeholder="e.g., LH5678"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can update your flight numbers later if they change.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Services Section */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">Additional Services</h3>
          <div className="space-y-4">
            {additionalServices.map((service) => (
              <div key={service.id} className="flex items-start space-x-3">
                <div className="flex h-5 items-center">
                  <Checkbox 
                    id={service.id} 
                    checked={selectedServiceIds.includes(service.id)}
                    onCheckedChange={(checked) => 
                      handleServiceChange(service.id, checked as boolean)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label 
                    htmlFor={service.id} 
                    className="flex justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-medium">{service.name}</span>
                      {service.description && (
                        <p className="text-sm text-gray-500">{service.description}</p>
                      )}
                    </div>
                    <span className="font-medium">
                      <CurrencySymbol size="lg" />
                      {service.price.toFixed(2)}
                    </span>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
}; 