"use client";

import { useState, useEffect, useRef } from "react";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    priceRange: number[];
    distance: number[];
    parkingTypes: string[];
    features: string[];
  }) => void;
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [distance, setDistance] = useState([0, 10]);
  const [selectedParkingTypes, setSelectedParkingTypes] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const isInitialMount = useRef(true);

  const parkingTypes = ["Covered", "Outdoor", "Both"];
  const features = [
    "24/7 Security",
    "CCTV",
    "EV Charging",
    "Car Wash",
    "Shuttle Service",
  ];

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      onFiltersChange({
        priceRange,
        distance,
        parkingTypes: selectedParkingTypes,
        features: selectedFeatures
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [priceRange, distance, selectedParkingTypes, selectedFeatures, onFiltersChange]);

  const handleParkingTypeChange = (type: string, checked: boolean) => {
    setSelectedParkingTypes(prev => 
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setSelectedFeatures(prev => 
      checked ? [...prev, feature] : prev.filter(f => f !== feature)
    );
  };

  const handleReset = () => {
    setPriceRange([0, 100]);
    setDistance([0, 10]);
    setSelectedParkingTypes([]);
    setSelectedFeatures([]);
  };

  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Price Range (€)</h3>
        <Slider
          defaultValue={priceRange}
          value={priceRange}
          max={100}
          step={1}
          onValueChange={(value) => {
            setPriceRange(value);
          }}
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Distance to Airport (km)</h3>
        <Slider
          defaultValue={distance}
          value={distance}
          max={10}
          step={0.5}
          onValueChange={(value) => {
            setDistance(value);
          }}
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>{distance[0]} km</span>
          <span>{distance[1]} km</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Parking Type</h3>
        <div className="space-y-2">
          {parkingTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={type}
                checked={selectedParkingTypes.includes(type)}
                onCheckedChange={(checked) => 
                  handleParkingTypeChange(type, checked as boolean)
                }
              />
              <Label htmlFor={type}>{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Features</h3>
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox 
                id={feature}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={(checked) => 
                  handleFeatureChange(feature, checked as boolean)
                }
              />
              <Label htmlFor={feature}>{feature}</Label>
            </div>
          ))}
        </div>
      </div>

      <Button 
        className="w-full" 
        variant="outline"
        onClick={handleReset}
      >
        Reset Filters
      </Button>
    </div>
  );
} 