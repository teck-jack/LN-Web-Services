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
  serviceId: {
    _id: string;
    name: string;
    type: string;
    processSteps?: Array<{
      stepNumber: number;
      title: string;
      description: string;
    }>;
  };
  employeeId?: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  currentStep?: number;
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: {
      _id: string;
      name: string;
    };
  }>;
  notes?: Array<{
    text: string;
    createdBy: {
      _id: string;
      name: string;
      role: string;
    };
    createdAt: string;
  }>;
  assignedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  workflowTemplate?: {
    _id: string;
    name: string;
    steps: Array<{
      _id: string;
      stepName: string;
      description?: string;
      order: number;
      estimatedDuration: number;
      checklistItems: Array<{
        _id: string;
        title: string;
        description?: string;
        isOptional: boolean;
        order: number;
      }>;
    }>;
  };
  checklistProgress?: Array<{
    stepId: string;
    itemId: string;
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: string;
  }>;
}

interface Notification {
  _id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedCaseId?: {
    _id: string;
    caseId: string;
  };
  createdAt: string;
}

interface Profile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  assignedModules: string[];
  isActive: boolean;
  createdAt: string;
}

interface EmployeeState {
  cases: Case[];
  case: Case | null;
  notifications: Notification[];
  unreadCount: number;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  pagination: {
    cases: {
      page: number;
      limit: number;
      total: number;
    };
    notifications: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

const initialState: EmployeeState = {
  cases: [],
  case: null,
  notifications: [],
  unreadCount: 0,
  profile: null,
  loading: false,
  error: null,
  pagination: {
    cases: {
      page: 1,
      limit: 10,
      total: 0,
    },
    notifications: {
      page: 1,
      limit: 10,
      total: 0,
    },
  },
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCases: (state, action: PayloadAction<{ data: Case[]; total: number }>) => {
      state.cases = action.payload.data;
      state.pagination.cases.total = action.payload.total;
    },
    setCase: (state, action: PayloadAction<Case | null>) => {
      state.case = action.payload;
    },
    updateCase: (state, action: PayloadAction<Case>) => {
      if (state.case?._id === action.payload._id) {
        state.case = action.payload;
      }
      const index = state.cases.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.cases[index] = action.payload;
      }
    },
    setNotifications: (state, action: PayloadAction<{ data: Notification[]; total: number }>) => {
      state.notifications = action.payload.data;
      state.pagination.notifications.total = action.payload.total;
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n._id === action.payload);
      if (notification) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.profile = action.payload;
    },
    setCasesPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.pagination.cases = { ...state.pagination.cases, ...action.payload };
    },
    setNotificationsPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.pagination.notifications = { ...state.pagination.notifications, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setError,
  setCases,
  setCase,
  updateCase,
  setNotifications,
  setUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  setProfile,
  setCasesPagination,
  setNotificationsPagination,
} = employeeSlice.actions;

export default employeeSlice.reducer;
