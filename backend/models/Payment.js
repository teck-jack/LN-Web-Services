const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Case',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
    // This stores the final amount after discount (if any)
  },
  transactionId: {
    type: String,
    required: [true, 'Please add a transaction ID'],
    unique: true
  },
  paymentMethod: {
    type: String,
    enum: [
      'razorpay',           // Online payment via Razorpay
      'cash',               // Cash payment (Admin/Employee only)
      'test_payment',       // Test mode
      'employee_enrollment', // Legacy - direct enrollment
      'agent_enrollment'    // Legacy - agent enrollment
    ],
    required: [true, 'Please add a payment method']
  },
  // Cash payment details (only for cash payments)
  cashPaymentDetails: {
    receivedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'  // Admin or Employee who received cash
    },
    receivedAt: {
      type: Date
    },
    receiptNumber: {
      type: String  // Manual receipt number if any
    },
    notes: {
      type: String  // Additional notes about cash payment
    }
  },
  // Payment metadata for audit trail
  paymentMetadata: {
    enrolledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    enrollerRole: {
      type: String,
      enum: ['admin', 'employee', 'agent', 'associate', 'end_user']
    },
    paymentInitiatedFrom: {
      type: String,
      enum: ['admin_panel', 'employee_panel', 'end_user_portal', 'agent_portal', 'associate_portal']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 🆕 NEW FIELDS FOR SRS
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  invoiceUrl: {
    type: String,
    trim: true
  },
  receiptUrl: {
    type: String,
    trim: true
  },
  invoiceGeneratedAt: {
    type: Date
  },
  receiptGeneratedAt: {
    type: Date
  },
  // 🆕 COUPON DISCOUNT FIELDS
  couponCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  couponId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Coupon'
  },
  originalAmount: {
    type: Number
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  }
});

// Generate invoice number before saving
PaymentSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();

    // Format: INV-YYYYMM-TIMESTAMP-RANDOM
    // Example: INV-202601-1737877200000-A3F
    this.invoiceNumber = `INV-${year}${month}-${timestamp}-${randomSuffix}`;
  }
  next();
});

// Indexes for performance optimization
// Note: transactionId and invoiceNumber already have indexes via unique: true
PaymentSchema.index({ 'paymentMetadata.enrolledBy': 1, status: 1, paymentDate: -1 });
PaymentSchema.index({ caseId: 1 });
PaymentSchema.index({ status: 1, paymentDate: -1 });
PaymentSchema.index({ paymentMethod: 1 });
PaymentSchema.index({ 'paymentMetadata.enrollerRole': 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);