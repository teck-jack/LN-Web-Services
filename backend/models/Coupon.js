const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [3, 'Coupon code must be at least 3 characters'],
        maxlength: [20, 'Coupon code cannot exceed 20 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    discountPercentage: {
        type: Number,
        required: [true, 'Please add a discount percentage'],
        min: [1, 'Discount must be at least 1%'],
        max: [100, 'Discount cannot exceed 100%']
    },
    validFrom: {
        type: Date,
        required: [true, 'Please add a valid from date'],
        default: Date.now
    },
    validTo: {
        type: Date,
        required: [true, 'Please add a valid to date']
    },
    maxTotalUses: {
        type: Number,
        default: null, // null means unlimited
        min: [1, 'Max total uses must be at least 1']
    },
    maxUsesPerUser: {
        type: Number,
        default: 1,
        min: [1, 'Max uses per user must be at least 1']
    },
    currentUses: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    usageHistory: [{
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        caseId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Case',
            required: true
        },
        paymentId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Payment',
            required: true
        },
        discountAmount: {
            type: Number,
            required: true
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
CouponSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if coupon is valid
CouponSchema.methods.isValid = function () {
    const now = new Date();

    // Check if active
    if (!this.isActive) {
        return { valid: false, reason: 'Coupon is inactive' };
    }

    // Check if within valid date range
    if (now < this.validFrom) {
        return { valid: false, reason: 'Coupon is not yet valid' };
    }

    if (now > this.validTo) {
        return { valid: false, reason: 'Coupon has expired' };
    }

    // Check if max total uses exceeded
    if (this.maxTotalUses !== null && this.currentUses >= this.maxTotalUses) {
        return { valid: false, reason: 'Coupon usage limit reached' };
    }

    return { valid: true };
};

// Method to check if user can use this coupon
CouponSchema.methods.canUserUse = function (userId) {
    const userUsageCount = this.usageHistory.filter(
        usage => usage.userId.toString() === userId.toString()
    ).length;

    if (userUsageCount >= this.maxUsesPerUser) {
        return { canUse: false, reason: 'You have already used this coupon the maximum number of times' };
    }

    return { canUse: true };
};

// Method to calculate discount amount
CouponSchema.methods.calculateDiscount = function (originalAmount) {
    const discountAmount = Math.round((originalAmount * this.discountPercentage) / 100);
    const finalAmount = originalAmount - discountAmount;

    return {
        originalAmount,
        discountPercentage: this.discountPercentage,
        discountAmount,
        finalAmount
    };
};

// Method to record usage
CouponSchema.methods.recordUsage = async function (userId, caseId, paymentId, discountAmount) {
    this.usageHistory.push({
        userId,
        caseId,
        paymentId,
        discountAmount,
        usedAt: new Date()
    });

    this.currentUses += 1;
    await this.save();
};

// Virtual for checking if expired
CouponSchema.virtual('isExpired').get(function () {
    return new Date() > this.validTo;
});

// Virtual for remaining uses
CouponSchema.virtual('remainingUses').get(function () {
    if (this.maxTotalUses === null) {
        return 'Unlimited';
    }
    return Math.max(0, this.maxTotalUses - this.currentUses);
});

CouponSchema.set('toJSON', { virtuals: true });
CouponSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Coupon', CouponSchema);
