import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportsState {
  reports: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action: PayloadAction<any[]>) => {
      state.reports = action.payload;
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

export const { setReports, setLoading, setError, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
