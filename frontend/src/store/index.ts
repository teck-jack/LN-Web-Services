import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/usersSlice';
import casesReducer from './slices/casesSlice';
import servicesReducer from './slices/servicesSlice';
import reportsReducer from './slices/reportsSlice';
import agentReducer from './slices/agentSlice';
import employeeReducer from './slices/employeeSlice';
import endUserReducer from './slices/endUserSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    users: usersReducer,
    cases: casesReducer,
    services: servicesReducer,
    reports: reportsReducer,
    agent: agentReducer,
    employee: employeeReducer,
    endUser: endUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
