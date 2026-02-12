import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
    CreditCard,
    Shield,
    CheckCircle2,
    Tag,
    X,
    PartyPopper,
    FileText,
    IndianRupee,
    Clock,
    Banknote,
    Wallet,
    FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import { paymentService, enrollmentService } from "@/services/paymentService";
import { couponService } from "@/services/couponService";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Service {
    _id: string;
    name: string;
    type: string;
    description?: string;
    price: number;
    duration?: string;
}

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: Service | null;
    endUserId: string;
    endUserName?: string;
    endUserEmail?: string;
    endUserPhone?: string;
    onSuccess?: (data: { case: any; payment: any }) => void;
    onCancel?: () => void;
    newUserData?: any; // Optional new user data for deferred creation
}

interface SuccessData {
    case: {
        _id: string;
        caseId: string;
        status: string;
    };
    payment: {
        invoiceNumber: string;
        transactionId: string;
        amount: number;
        status: string;
        paymentMethod?: string;
    };
}

type PaymentMethod = 'razorpay' | 'cash' | 'test_payment';

export function PaymentDialog({
    open,
    onOpenChange,
    service,
    endUserId,
    endUserName,
    endUserEmail,
    endUserPhone,
    onSuccess,
    onCancel,
    newUserData,
}: PaymentDialogProps) {
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
    const [testMode, setTestMode] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const navigate = useNavigate();

    // Cash payment details
    const [cashDetails, setCashDetails] = useState({
        receiptNumber: "",
        notes: ""
    });

    // Available payment methods based on user role
    const availablePaymentMethods = useMemo(() => {
        const methods = [
            {
                value: 'razorpay' as PaymentMethod,
                label: 'Online Payment',
                icon: CreditCard,
                description: 'Secure payment via Razorpay'
            },
            // {
            //     value: 'test_payment' as PaymentMethod,
            //     label: 'Test Mode',
            //     icon: FlaskConical,
            //     description: 'For testing (no real payment)'
            // }
        ];

        // Cash payment only for Admin and Employee
        if (user?.role === 'admin' || user?.role === 'employee') {
            methods.splice(1, 0, {
                value: 'cash' as PaymentMethod,
                label: 'Cash Payment',
                icon: Banknote,
                description: 'Record cash payment received'
            });
        }

        return methods;
    }, [user?.role]);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setPaymentMethod('razorpay');
            setTestMode(false);
            setTermsAccepted(false);
            setProcessing(false);
            setCouponCode("");
            setAppliedCoupon(null);
            setShowSuccess(false);
            setSuccessData(null);
            setCashDetails({ receiptNumber: "", notes: "" });
        }
    }, [open]);

    if (!service) return null;

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return;

        try {
            setValidatingCoupon(true);
            const response = await couponService.validateCoupon(couponCode.trim(), service._id);
            setAppliedCoupon(response.data);
            toast.success(`Coupon applied! ${response.data.coupon.discountPercentage}% discount`);
        } catch (error: any) {
            toast.error(error.message || "Invalid coupon code");
            setAppliedCoupon(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setAppliedCoupon(null);
    };

    const calculatePrices = () => {
        const basePrice = appliedCoupon ? appliedCoupon.discount.finalAmount : service.price;
        const gst = Math.round(basePrice * 0);
        const total = basePrice + gst;
        const discount = appliedCoupon ? appliedCoupon.discount.discountAmount : 0;
        return { basePrice, gst, total, discount };
    };

    const handlePayment = async () => {
        if (!termsAccepted) {
            toast.error("Please accept terms and conditions");
            return;
        }

        try {
            setProcessing(true);

            // Handle cash payment differently
            if (paymentMethod === 'cash') {
                const response = await enrollmentService.createEnrollment({
                    endUserId,
                    serviceId: service._id,
                    paymentMethod: 'cash',
                    cashDetails: {
                        receiptNumber: cashDetails.receiptNumber || undefined,
                        notes: cashDetails.notes || 'Cash payment received'
                    },
                    couponCode: appliedCoupon?.coupon?.code,
                    newUserData // Pass new user data for deferred creation
                });

                if (response.success) {
                    setSuccessData({
                        case: response.data.case,
                        payment: response.data.payment,
                    });
                    setShowSuccess(true);
                    toast.success("Enrollment completed with cash payment!");
                }
                return;
            }

            // Handle Razorpay and Test Mode
            const isTest = paymentMethod === 'test_payment' || testMode;

            const enrollResponse = await enrollmentService.createEnrollment({
                endUserId,
                serviceId: service._id,
                paymentMethod: paymentMethod === 'test_payment' ? 'test_payment' : 'razorpay',
                isTestMode: isTest,
                couponCode: appliedCoupon?.coupon?.code,
                newUserData // Pass new user data for deferred creation
            });

            if (!enrollResponse.success || !enrollResponse.requiresPaymentVerification) {
                throw new Error("Failed to create enrollment");
            }

            const { order, discount, coupon } = enrollResponse.data;

            if (isTest) {
                // Test payment - immediate verification
                const verifyResponse = await paymentService.verifyEnrollment({
                    razorpay_order_id: order.id,
                    razorpay_payment_id: `test_pay_${Date.now()}`,
                    razorpay_signature: "test_signature",
                    serviceId: service._id,
                    endUserId,
                    isTestMode: true,
                    couponCode: coupon?.code,
                    couponId: coupon?.id,
                    discountInfo: discount,
                    newUserData // Pass new user data for verification/creation
                });

                if (verifyResponse.success) {
                    setSuccessData({
                        case: verifyResponse.data.case,
                        payment: verifyResponse.data.payment,
                    });
                    setShowSuccess(true);
                    toast.success("Payment successful!");
                }
            } else {
                // Real Razorpay payment
                paymentService.openPaymentWindow({
                    order,
                    service,
                    user: {
                        name: endUserName || "",
                        email: endUserEmail || "",
                        phone: endUserPhone || "",
                    },
                    onSuccess: async (response) => {
                        try {
                            const verifyResponse = await paymentService.verifyEnrollment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                serviceId: service._id,
                                endUserId,
                                isTestMode: false,
                                couponCode: coupon?.code,
                                couponId: coupon?.id,
                                discountInfo: discount,
                                newUserData // Pass new user data for verification/creation
                            });

                            if (verifyResponse.success) {
                                // Redirect to success page with payment details
                                const successParams = new URLSearchParams({
                                    userName: endUserName || "",
                                    userEmail: endUserEmail || "",
                                    userId: endUserId,
                                    serviceName: service.name,
                                    amount: prices.total.toString(),
                                    paymentId: response.razorpay_payment_id,
                                    caseId: verifyResponse.data.case._id,
                                });

                                const successUrl = user?.role === 'agent'
                                    ? `/agent/payment/success?${successParams}`
                                    : `/associate/payment/success?${successParams}`;

                                onOpenChange(false);
                                navigate(successUrl);
                                toast.success("Payment successful!");
                            }
                        } catch (error: any) {
                            // Redirect to failure page with error details
                            const failureParams = new URLSearchParams({
                                userName: endUserName || "",
                                userId: endUserId,
                                serviceName: service.name,
                                amount: prices.total.toString(),
                                error: error.message || "Payment verification failed",
                                reason: error.response?.data?.error || "",
                            });

                            const failureUrl = user?.role === 'agent'
                                ? `/agent/payment/failure?${failureParams}`
                                : `/associate/payment/failure?${failureParams}`;

                            onOpenChange(false);
                            navigate(failureUrl);
                            toast.error(error.message || "Payment verification failed");
                        }
                        setProcessing(false);
                    },
                    onFailure: (error) => {
                        // Redirect to failure page
                        const failureParams = new URLSearchParams({
                            userName: endUserName || "",
                            userId: endUserId,
                            serviceName: service.name,
                            amount: prices.total.toString(),
                            error: error.error?.description || "Payment failed",
                            reason: error.error?.reason || "",
                        });

                        const failureUrl = user?.role === 'agent'
                            ? `/agent/payment/failure?${failureParams}`
                            : `/associate/payment/failure?${failureParams}`;

                        onOpenChange(false);
                        navigate(failureUrl);
                        toast.error(`Payment failed: ${error.error?.description || "Unknown error"}`);
                        setProcessing(false);
                    },
                    onDismiss: () => {
                        setProcessing(false);
                    },
                });
                return;
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.message || "Payment failed");
        } finally {
            if (paymentMethod === 'cash' || paymentMethod === 'test_payment' || testMode) {
                setProcessing(false);
            }
        }
    };

    const handleClose = () => {
        if (showSuccess && successData) {
            onSuccess?.(successData);
        } else {
            onCancel?.();
        }
        onOpenChange(false);
    };

    const prices = calculatePrices();

    // Success View
    if (showSuccess && successData) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <PartyPopper className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogTitle className="text-2xl text-center">Payment Successful!</DialogTitle>
                        <DialogDescription className="text-center">
                            {endUserName ? `${endUserName} has been` : "User has been"} enrolled in {service.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Case ID</p>
                                    <p className="font-mono font-semibold text-lg">{successData.case.caseId}</p>
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                    {successData.case.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-700 dark:text-green-400">
                                    Payment Details
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Invoice</span>
                                    <span className="font-mono">{successData.payment.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-bold text-green-600">
                                        ₹{successData.payment.amount?.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method</span>
                                    <Badge variant="outline" className="capitalize">
                                        {successData.payment.paymentMethod?.replace('_', ' ') || 'Razorpay'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant="default" className="bg-green-600">
                                        {successData.payment.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleClose} className="w-full">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Payment Form View
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>
                        {endUserName ? `Enroll ${endUserName} in` : "Enroll user in"} {service.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    {/* Service Details */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold">{service.name}</h4>
                                <Badge variant="outline" className="mt-1 capitalize">
                                    {service.type?.replace("_", " ")}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1">
                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-bold text-lg">₹{service.price.toLocaleString()}</span>
                                </div>
                                {service.duration && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{service.duration}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Select Payment Method</Label>
                        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                            {availablePaymentMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <div key={method.value} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors">
                                        <RadioGroupItem value={method.value} id={method.value} />
                                        <Label htmlFor={method.value} className="flex items-center gap-3 cursor-pointer flex-1">
                                            <Icon className="h-5 w-5 text-primary" />
                                            <div className="flex-1">
                                                <div className="font-medium">{method.label}</div>
                                                <div className="text-xs text-muted-foreground">{method.description}</div>
                                            </div>
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    {/* Cash Payment Details */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="h-4 w-4 text-yellow-600" />
                                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Cash Payment Details</span>
                            </div>
                            <div>
                                <Label htmlFor="receiptNumber" className="text-sm">Receipt Number (Optional)</Label>
                                <Input
                                    id="receiptNumber"
                                    value={cashDetails.receiptNumber}
                                    onChange={(e: any) => setCashDetails(prev => ({
                                        ...prev,
                                        receiptNumber: e.target.value
                                    }))}
                                    placeholder="e.g., RCP-2026-001"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cashNotes" className="text-sm">Notes</Label>
                                <Textarea
                                    id="cashNotes"
                                    value={cashDetails.notes}
                                    onChange={(e: any) => setCashDetails(prev => ({
                                        ...prev,
                                        notes: e.target.value
                                    }))}
                                    placeholder="Add notes about the cash payment..."
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Test Mode Info for Razorpay/Test - DISABLED FOR PRODUCTION */}
                    {/* {(paymentMethod === 'razorpay' || paymentMethod === 'test_payment') && (
                        <>
                            {paymentMethod === 'razorpay' && (
                                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-accent/50">
                                    <Checkbox
                                        id="test-mode"
                                        checked={testMode}
                                        onCheckedChange={(checked) => setTestMode(checked as boolean)}
                                    />
                                    <label htmlFor="test-mode" className="text-sm font-medium cursor-pointer">
                                        Test Mode (No real payment)
                                    </label>
                                </div>
                            )}

                            {(testMode || paymentMethod === 'test_payment') && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Test mode active. No real money will be charged.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )} */}

                    {/* Coupon Code */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Coupon Code (Optional)
                        </label>
                        {!appliedCoupon ? (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter code"
                                    value={couponCode}
                                    onChange={(e: any) => setCouponCode(e.target.value.toUpperCase())}
                                    className="font-mono"
                                    disabled={validatingCoupon}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleValidateCoupon}
                                    disabled={validatingCoupon || !couponCode.trim()}
                                >
                                    {validatingCoupon ? "..." : "Apply"}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="font-mono font-semibold text-green-800 dark:text-green-200">
                                        {appliedCoupon.coupon.code}
                                    </span>
                                    <span className="text-sm text-green-600">
                                        ({appliedCoupon.coupon.discountPercentage}% off)
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service Fee</span>
                            <span>₹{service.price.toLocaleString()}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({appliedCoupon.coupon.discountPercentage}%)</span>
                                <span>-₹{prices.discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">GST</span>
                            <span>₹{prices.gst.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>Total</span>
                            <span className="text-lg text-primary">₹{prices.total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-2 pt-2">
                        <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        />
                        <label htmlFor="terms" className="text-sm cursor-pointer">
                            I agree to the terms and conditions
                        </label>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row flex-shrink-0">
                    <Button variant="outline" onClick={handleClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePayment}
                        disabled={!termsAccepted || processing}
                        className="flex-1"
                    >
                        {processing ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {paymentMethod === 'cash' ? (
                                    <>
                                        <Banknote className="h-4 w-4 mr-2" />
                                        Complete Cash Enrollment
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pay ₹{prices.total.toLocaleString()}
                                    </>
                                )}
                            </>
                        )}
                    </Button>
                </DialogFooter>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                    <Shield className="h-3 w-3" />
                    <span>Secured by Razorpay • 256-bit SSL</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
