import api from './api';

export const getDashboard = () => {
  return api.get('/enduser/dashboard');
};

export const getServices = () => {
  return api.get('/enduser/services');
};

export const getService = (id: string) => {
  return api.get(`/enduser/services/${id}`);
};

export const createPaymentOrder = (serviceId: string, isTestMode?: boolean, couponCode?: string) => {
  return api.post('/enduser/payment/create-order', { serviceId, isTestMode, couponCode });
};

export const verifyPayment = (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  serviceId: string;
  isTestMode?: boolean;
  couponCode?: string;
  couponId?: string;
  discountInfo?: any;
}) => {
  return api.post('/enduser/payment/verify', { ...paymentData });
};

export const getCases = (params: { status?: string; page?: number; limit?: number }) => {
  return api.get('/enduser/cases', { params });
};

export const getCase = (id: string) => {
  return api.get(`/enduser/cases/${id}`);
};

export const addNote = (id: string, noteData: { text: string }) => {
  return api.post(`/enduser/cases/${id}/notes`, noteData);
};

export const uploadDocument = (id: string, documentData: { name: string; url: string }) => {
  return api.post(`/enduser/cases/${id}/documents`, documentData);
};

export const getPayments = (params: { page?: number; limit?: number }) => {
  return api.get('/enduser/payments', { params });
};

export const getNotifications = (params: { page?: number; limit?: number; isRead?: boolean }) => {
  return api.get('/enduser/notifications', { params });
};

export const markNotificationAsRead = (id: string) => {
  return api.put(`/enduser/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
  return api.put('/enduser/notifications/read-all');
};

export const getProfile = () => {
  return api.get('/enduser/profile');
};

export const updateProfile = (profileData: any) => {
  return api.put('/enduser/profile', profileData);
};

export const getRequiredDocuments = (caseId: string) => {
  return api.get(`/enduser/cases/${caseId}/required-documents`);
};

