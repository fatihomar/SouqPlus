import { create } from 'zustand';

export interface ListingFormData {
  // Step 1: Basic Info
  category: 'REAL_ESTATE' | 'CAR' | '';
  listingType: 'SALE' | 'RENT' | '';
  title: string;
  whatsappNumber?: string;

  price: number | '';
  rentPeriod?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | '';
  city: string;
  district: string;
  images: File[];

  // Step 2: Dynamic Details (Property or Car)
  propertyDetails?: {
    propertyType: string;
    area: number | '';
    bedrooms?: number | '';
    bathrooms?: number | '';
    floor?: number | '';
    yearBuilt?: number | '';
    amenities?: string[];
  };
  
  // Step 3: Images (Store File objects temporarily, but for persist we can only store URLs or local blob URLs.
  // Wait, File objects cannot be JSON serialized by persist middleware.
  // Instead of persisting the actual Files (which is impossible), we will NOT persist the files themselves.
  // We will persist everything else. For images, they have to re-select them if they refresh, OR we upload them immediately.
  // Actually, standard practice: we don't persist File objects. We'll store them in a non-persisted part of state or just accept they reset on refresh.
}

interface CreateListingState {
  currentStep: number;
  formData: ListingFormData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<ListingFormData>) => void;
  resetForm: () => void;
}

const initialFormData: ListingFormData = {
  category: '',
  listingType: '',
  title: '',
  whatsappNumber: '',

  price: '',
  city: '',
  district: '',
  images: [],
};

export const useCreateListingStore = create<CreateListingState>()(
  (set) => ({
    currentStep: 1,
    formData: initialFormData,
    
    setStep: (step) => set({ currentStep: step }),
    nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
    prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
    
    updateFormData: (data) => 
      set((state) => ({
        formData: { ...state.formData, ...data },
      })),
      
    resetForm: () => set({ currentStep: 1, formData: initialFormData }),
  })
);
