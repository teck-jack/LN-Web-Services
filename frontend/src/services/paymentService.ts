import api from './api';

/**
 * Unified Payment Service
 * Used by all roles for enrollment payments
 */

export const paymentService = {
    /**
     * Create a payment order for enrollment
     * @param serviceId - The service to enroll in
     * @param endUserId - Optional: The end user ID (for agent/employee enrolling someone)
     * @param isTestMode - Whether to use test mode
     * @param couponCode - Optional coupon code
     */
    createOrder: async (data: {
        serviceId: string;
        endUserId?: string;
        isTestMode: boolean;
        couponCode?: string;
    }) => {
        const response = await api.post('/payment/create-order', data);
        return response.data;
    },

    /**
     * Verify payment and complete enrollment
     */
    verifyEnrollment: async (data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        serviceId: string;
        endUserId?: string;
        enrollmentType?: string;
        isTestMode?: boolean;
        couponCode?: string;
        couponId?: string;
        discountInfo?: any;
    }) => {
        const response = await api.post('/payment/verify-enrollment', data);
        return response.data;
    },

    /**
     * Open Razorpay payment window
     * Returns a promise that resolves with payment response or rejects on failure
     */
    openPaymentWindow: (options: {
        order: any;
        service: any;
        user: any;
        onSuccess: (response: any) => void;
        onFailure: (error: any) => void;
        onDismiss?: () => void;
    }) => {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_UfYSRe7oekOT1m';

        // Load Razorpay script if not loaded
        const loadRazorpay = (): Promise<void> => {
            return new Promise((resolve, reject) => {
                if ((window as any).Razorpay) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load Razorpay'));
                document.body.appendChild(script);
            });
        };

        loadRazorpay().then(() => {
            const razorpayOptions = {
                key: razorpayKey,
                amount: options.order.amount,
                currency: options.order.currency,
                name: 'LN Services',
                description: options.service.name,
                image: '/logo.png',
                order_id: options.order.id,
                handler: options.onSuccess,
                prefill: {
                    name: options.user?.name || '',
                    email: options.user?.email || '',
                    contact: options.user?.phone || '',
                },
                notes: {
                    serviceId: options.service._id,
                    serviceName: options.service.name,
                },
                theme: {
                    color: '#6366f1',
                },
                modal: {
                    ondismiss: options.onDismiss,
                },
            };

            const razorpay = new (window as any).Razorpay(razorpayOptions);
            razorpay.on('payment.failed', options.onFailure);
            razorpay.open();
        }).catch(options.onFailure);
    },
};

/**
 * Enrollment Service
 * Handles multi-channel enrollment (Razorpay, Cash, Test Mode)
 */
export const enrollmentService = {
    /**
     * Get available payment methods for current user
     */
    getPaymentMethods: async () => {
        const response = await api.get('/enrollment/payment-methods');
        return response.data;
    },

    /**
     * Create enrollment with selected payment method
     */
    createEnrollment: async (data: {
        endUserId?: string;
        serviceId: string;
        paymentMethod: 'razorpay' | 'cash' | 'test_payment';
        cashDetails?: {
            receiptNumber?: string;
            notes?: string;
        };
        couponCode?: string;
        isTestMode?: boolean;
    }) => {
        const response = await api.post('/enrollment/create', data);
        return response.data;
    },
};

/**
 * Payment History Service
 * Handles payment history retrieval with role-based access
 */
export const paymentHistoryService = {
    /**
     * Get payment history for current user (role-based)
     */
    getPaymentHistory: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
        paymentMethod?: string;
        searchQuery?: string;
        serviceType?: string;
    }) => {
        const response = await api.get('/payment/history', { params });
        return response.data;
    },

    /**
     * Get payment analytics/statistics
     */
    getPaymentAnalytics: async () => {
        const response = await api.get('/payment/analytics');
        return response.data;
    },

    /**
     * Export payment history as CSV
     */
    exportPaymentHistory: async (params?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        paymentMethod?: string;
        serviceType?: string;
    }) => {
        const response = await api.get('/payment/export', {
            params,
            responseType: 'blob'
        });
        return response.data;
    },
};
