import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'agent' | 'associate' | 'employee' | 'end_user';
  sourceTag?: 'self' | 'agent' | 'admin_direct';
  agentId?: string;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface UsersState {
  users: User[];
  user: User | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

const initialState: UsersState = {
  users: [],
  user: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
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

export const { setUsers, setUser, setPagination, setLoading, setError, clearError } = usersSlice.actions;
export default usersSlice.reducer;
