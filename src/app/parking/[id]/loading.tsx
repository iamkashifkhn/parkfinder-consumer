import { LoadingSpinner } from "@/components/ui/loading";

export default function ParkingLoading() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}