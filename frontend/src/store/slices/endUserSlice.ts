import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as endUserService from '@/services/endUserService';

interface Service {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
  documentsRequired: string[];
  processSteps: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  createdAt: string;
}

interface Case {
  _id: string;
  caseId: string;
  serviceId: {
    _id: string;
    name: string;
    type: string;
    processSteps?: {
      stepNumber: number;
      title: string;
      description: string;
    }[];
  };
  employeeId?: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  currentStep: number;
  documents?: {
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: {
      _id: string;
      name: string;
    };
  }[];
  notes?: {
    text: string;
    createdBy: {
      _id: string;
      name: string;
      role: string;
    };
    createdAt: string;
  }[];
  assignedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  _id: string;
  caseId: {
    _id: string;
    caseId: string;
  };
  amount: number;
  transactionId: string;
  paymentMethod: string;
  status: string;
  paymentDate: string;
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
  phone: string;
  role: string;
  sourceTag: string;
  agentId?: string;
  isActive: boolean;
  createdAt: string;
}

interface EndUserState {
  services: Service[];
  service: Service | null;
  cases: Case[];
  case: Case | null;
  payments: Payment[];
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
    payments: {
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

const initialState: EndUserState = {
  services: [],
  service: null,
  cases: [],
  case: null,
  payments: [],
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
    payments: {
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

export const getDashboard = createAsyncThunk(
  'endUser/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await endUserService.getDashboard();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const getServices = createAsyncThunk(
  'endUser/getServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await endUserService.getServices();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const getService = createAsyncThunk(
  'endUser/getService',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await endUserService.getService(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service');
    }
  }
);

export const getCases = createAsyncThunk(
  'endUser/getCases',
  async (params: { status?: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await endUserService.getCases(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cases');
    }
  }
);

export const getCase = createAsyncThunk(
  'endUser/getCase',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await endUserService.getCase(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch case');
    }
  }
);

export const addNote = createAsyncThunk(
  'endUser/addNote',
  async ({ id, noteData }: { id: string; noteData: { text: string } }, { rejectWithValue }) => {
    try {
      const response = await endUserService.addNote(id, noteData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'endUser/uploadDocument',
  async ({ id, documentData }: { id: string; documentData: { name: string; url: string } }, { rejectWithValue }) => {
    try {
      const response = await endUserService.uploadDocument(id, documentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

export const getPayments = createAsyncThunk(
  'endUser/getPayments',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await endUserService.getPayments(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const getNotifications = createAsyncThunk(
  'endUser/getNotifications',
  async (params: { page?: number; limit?: number; isRead?: boolean }, { rejectWithValue }) => {
    try {
      const response = await endUserService.getNotifications(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'endUser/markNotificationAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await endUserService.markNotificationAsRead(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'endUser/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await endUserService.markAllNotificationsAsRead();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const getProfile = createAsyncThunk(
  'endUser/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await endUserService.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'endUser/updateProfile',
  async (profileData: Partial<Profile>, { rejectWithValue }) => {
    try {
      const response = await endUserService.updateProfile(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const endUserSlice = createSlice({
  name: 'endUser',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearService: (state) => {
      state.service = null;
    },
    clearCase: (state) => {
      state.case = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Dashboard
      .addCase(getDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = action.payload.data.cases || [];
        state.unreadCount = action.payload.data.unreadNotifications || 0;
        state.payments = action.payload.data.recentPayments || [];
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Services
      .addCase(getServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data;
      })
      .addCase(getServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Service
      .addCase(getService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getService.fulfilled, (state, action) => {
        state.loading = false;
        state.service = action.payload.data;
      })
      .addCase(getService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Cases
      .addCase(getCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCases.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = action.payload.data;
        state.pagination.cases = action.payload.pagination;
      })
      .addCase(getCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Case
      .addCase(getCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCase.fulfilled, (state, action) => {
        state.loading = false;
        state.case = action.payload.data;
      })
      .addCase(getCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Note
      .addCase(addNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        state.loading = false;
        state.case = action.payload.data;
      })
      .addCase(addNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.case = action.payload.data;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Payments
      .addCase(getPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data;
        state.pagination.payments = action.payload.pagination;
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.pagination.notifications = action.payload.pagination;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark Notification as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((n) => n._id === action.payload.data._id);
        if (index !== -1) {
          state.notifications[index] = action.payload.data;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark All Notifications as Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearService, clearCase } = endUserSlice.actions;
export default endUserSlice.reducer;
