import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    sourceTag: string;
    agentId: string;
    isActive: boolean;
    createdAt: string;
    caseStatus?: string;
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
    processSteps: Array<{
        stepNumber: number;
        title: string;
        description: string;
    }>;
    createdAt: string;
}

interface DashboardData {
    performance: {
        onboardedUsers: number;
        completedCases: number;
        inProgressCases: number;
        conversionRate: number;
    };
    monthlyStats: {
        onboarded: number;
        completed: number;
    };
}

interface ReportsData {
    summary: {
        onboardedUsers: number;
        completedCases: number;
        conversionRate: number;
    };
    monthlyStats: Array<{
        month: string;
        onboarded: number;
        completed: number;
    }>;
}

interface AssociateState {
    dashboard: DashboardData | null;
    onboardedUsers: User[];
    user: User | null;
    services: Service[];
    service: Service | null;
    reports: ReportsData | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

const initialState: AssociateState = {
    dashboard: null,
    onboardedUsers: [],
    user: null,
    services: [],
    service: null,
    reports: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
    },
};

const associateSlice = createSlice({
    name: 'associate',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setDashboard: (state, action: PayloadAction<DashboardData>) => {
            state.dashboard = action.payload;
        },
        setOnboardedUsers: (state, action: PayloadAction<{ users: User[]; pagination: any }>) => {
            state.onboardedUsers = action.payload.users;
            state.pagination = action.payload.pagination;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setServices: (state, action: PayloadAction<Service[]>) => {
            state.services = action.payload;
        },
        setService: (state, action: PayloadAction<Service>) => {
            state.service = action.payload;
        },
        setReports: (state, action: PayloadAction<ReportsData>) => {
            state.reports = action.payload;
        },
    },
});

export const {
    setLoading,
    setError,
    clearError,
    setDashboard,
    setOnboardedUsers,
    setUser,
    setServices,
    setService,
    setReports,
} = associateSlice.actions;

export default associateSlice.reducer;
