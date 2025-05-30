import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface Vehicle {
  id: string;
  licensePlate: string;
  makeAndModel: string;
  vehicleType: string;
  numberOfPeople: string;
}

interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  timestamp: string;
}

interface BookingState {
  parkingId: string | null;
  startDate: string | null;
  endDate: string | null;
  selectedServices: string[];
  additionalServices: AdditionalService[];
  outboundFlight: string;
  inboundFlight: string;
  vehicles: Vehicle[];
  timestamp: string | null;
  bookingId?: string;
  payment?: PaymentInfo;
  amount?: number | null;
  baseParkingAmount?: number | null;
  additionalServicesAmount?: number | null;
  vehicleMultiplier?: number;
  // Actions
  setBookingDetails: (details: Partial<Omit<BookingState, 'setBookingDetails' | 'clearBooking'>>) => void;
  clearBooking: () => void;
}

type BookingStore = StateCreator<
  BookingState,
  [],
  [],
  BookingState
>;

const initialState = {
  parkingId: null,
  startDate: null,
  endDate: null,
  selectedServices: [],
  additionalServices: [],
  outboundFlight: '',
  inboundFlight: '',
  vehicles: [],
  timestamp: null,
  bookingId: undefined,
  payment: undefined,
};

export const useBookingStore = create<BookingState>()(
  persist<BookingState>(
    ((set) => ({
      ...initialState,
      setBookingDetails: (details: Partial<Omit<BookingState, 'setBookingDetails' | 'clearBooking'>>) => 
        set((state: BookingState) => ({
          ...state,
          ...details,
          timestamp: new Date().toISOString(),
        })),
      clearBooking: () => set(initialState),
    })) as BookingStore,
    {
      name: 'booking-storage',
    } as PersistOptions<BookingState>
  )
); 