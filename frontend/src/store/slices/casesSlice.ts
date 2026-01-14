import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Case {
  _id: string;
  caseId: string;
  endUserId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  employeeId?: {
    _id: string;
    name: string;
    email: string;
  };
  serviceId: {
    _id: string;
    name: string;
    type: string;
  };
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  currentStep: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface CasesState {
  cases: Case[];
  case: Case | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

const initialState: CasesState = {
  cases: [],
  case: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.cases = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCase: (state, action: PayloadAction<Case>) => {
      state.case = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
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

export const { setCases, setCase, setPagination, setLoading, setError, clearError } = casesSlice.actions;
export default casesSlice.reducer;
