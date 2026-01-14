import api from "./api";

export interface Coupon {
    _id: string;
    code: string;
    description?: string;
    discountPercentage: number;
    validFrom: Date;
    validTo: Date;
    maxTotalUses: number | null;
    maxUsesPerUser: number;
    currentUses: number;
    isActive: boolean;
    createdBy: string;
    usageHistory: Array<{
        userId: string;
        caseId: string;
        paymentId: string;
        discountAmount: number;
        usedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
    isExpired?: boolean;
    remainingUses?: string | number;
}

export interface CreateCouponData {
    code: string;
    description?: string;
    discountPercentage: number;
    validFrom: Date | string;
    validTo: Date | string;
    maxTotalUses?: number | null;
    maxUsesPerUser?: number;
    isActive?: boolean;
}

export interface UpdateCouponData {
    description?: string;
    discountPercentage?: number;
    validFrom?: Date | string;
    validTo?: Date | string;
    maxTotalUses?: number | null;
    maxUsesPerUser?: number;
    isActive?: boolean;
}

export const couponService = {
    // Admin - Create coupon
    async createCoupon(data: CreateCouponData) {
        try {
            const response = await api.post("/admin/coupons", data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to create coupon");
        }
    },

    // Admin - Get all coupons
    async getCoupons(params?: { status?: string; page?: number; limit?: number }) {
        try {
            const response = await api.get("/admin/coupons", { params });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to fetch coupons");
        }
    },

    // Admin - Get single coupon
    async getCoupon(id: string) {
        try {
            const response = await api.get(`/admin/coupons/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to fetch coupon");
        }
    },

    // Admin - Update coupon
    async updateCoupon(id: string, data: UpdateCouponData) {
        try {
            const response = await api.put(`/admin/coupons/${id}`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to update coupon");
        }
    },

    // Admin - Delete coupon
    async deleteCoupon(id: string) {
        try {
            const response = await api.delete(`/admin/coupons/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to delete coupon");
        }
    },

    // Admin - Get coupon statistics
    async getCouponStats(id: string) {
        try {
            const response = await api.get(`/admin/coupons/${id}/stats`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to fetch coupon stats");
        }
    },

    // End User - Validate coupon
    async validateCoupon(code: string, serviceId: string) {
        try {
            const response = await api.post("/enduser/payment/validate-coupon", {
                code,
                serviceId,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to validate coupon");
        }
    },
};
