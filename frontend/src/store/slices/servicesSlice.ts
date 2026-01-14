import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
}

interface Service {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
  documentsRequired: string[];
  processSteps: ProcessStep[];
  createdAt: string;
}

interface ServicesState {
  services: Service[];
  service: Service | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  service: null,
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.services = action.payload;
      state.loading = false;
      state.error = null;
    },
    setService: (state, action: PayloadAction<Service>) => {
      state.service = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setServices, setService, setLoading, setError, clearError } = servicesSlice.actions;
export default servicesSlice.reducer;
