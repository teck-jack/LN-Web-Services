import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getService, clearService } from "@/store/slices/endUserSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/common/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ArrowLeft, CreditCard, Shield, CheckCircle2, Tag, X, PartyPopper, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import * as endUserService from "@/services/endUserService";
import { couponService } from "@/services/couponService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Razorpay Key from environment - MUST be configured
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY) {
  console.error('❌ CRITICAL: VITE_RAZORPAY_KEY_ID not found in environment variables!');
  console.error('Please set VITE_RAZORPAY_KEY_ID in your .env file or deployment environment.');
}

interface PaymentSuccessData {
  case: {
    _id: string;
    caseId: string;
    status: string;
  };
  payment: {
    _id: string;
    invoiceNumber: string;
    transactionId: string;
    amount: number;
    status: string;
    paymentMethod: string;
  };
  service: {
    name: string;
    type: string;
    price: number;
  };
}

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { service, loading } = useAppSelector((state) => state.endUser);
  const { user } = useAppSelector((state) => state.auth);

  const [processing, setProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successData, setSuccessData] = useState<PaymentSuccessData | null>(null);

  // Billing form state (pre-filled from user)
  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  useEffect(() => {
    if (id) {
      dispatch(getService(id));
    }
    return () => {
      dispatch(clearService());
    };
  }, [dispatch, id]);

  // Pre-fill billing info from logged-in user
  useEffect(() => {
    if (user) {
      setBillingInfo(prev => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setValidatingCoupon(true);
      const response = await couponService.validateCoupon(couponCode.trim(), service!._id);
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
    toast.info("Coupon removed");
  };

  const calculatePrices = () => {
    const basePrice = appliedCoupon ? appliedCoupon.discount.finalAmount : service!.price;
    const gst = 0; // GST set to 0% statically
    const total = basePrice + gst;
    const discount = appliedCoupon ? appliedCoupon.discount.discountAmount : 0;
    return { basePrice, gst, total, discount };
  };

  const handlePaymentSuccess = (data: PaymentSuccessData) => {
    setSuccessData(data);
    setSuccessDialogOpen(true);
    setProcessing(false);
  };

  const handlePayment = async () => {
    if (!service || !termsAccepted) {
      toast.error("Please accept terms and conditions");
      return;
    }

    try {
      setProcessing(true);

      // Create order on backend
      const orderResponse = await endUserService.createPaymentOrder(
        service._id,
        testMode,
        appliedCoupon?.coupon?.code
      );
      const { order, discount, coupon } = orderResponse.data.data;

      if (testMode) {
        // Test payment - directly verify with test credentials
        const verifyResponse = await endUserService.verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id: `test_pay_${Date.now()}`,
          razorpay_signature: "test_signature",
          serviceId: service._id,
          isTestMode: true,
          couponCode: coupon?.code,
          couponId: coupon?.id,
          discountInfo: discount
        });

        if (verifyResponse.data.success) {
          handlePaymentSuccess({
            case: verifyResponse.data.data.case,
            payment: verifyResponse.data.data.payment,
            service: {
              name: service.name,
              type: service.type,
              price: service.price
            }
          });
          toast.success("Test payment successful!");
        }
      } else {
        // Real Razorpay integration
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: RAZORPAY_KEY,
            amount: order.amount,
            currency: order.currency,
            name: "LN Services",
            description: service.name,
            image: "/logo.png",
            order_id: order.id,
            handler: async function (response: any) {
              try {
                const verifyResponse = await endUserService.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  serviceId: service._id,
                  isTestMode: false,
                  couponCode: coupon?.code,
                  couponId: coupon?.id,
                  discountInfo: discount
                });

                if (verifyResponse.data.success) {
                  handlePaymentSuccess({
                    case: verifyResponse.data.data.case,
                    payment: verifyResponse.data.data.payment,
                    service: {
                      name: service.name,
                      type: service.type,
                      price: service.price
                    }
                  });
                  toast.success("Payment successful!");
                }
              } catch (error: any) {
                toast.error(error.message || "Payment verification failed");
                setProcessing(false);
              }
            },
            prefill: {
              name: billingInfo.fullName || user?.name || "",
              email: billingInfo.email || user?.email || "",
              contact: billingInfo.phone || user?.phone || "",
            },
            notes: {
              serviceId: service._id,
              serviceName: service.name
            },
            theme: {
              color: "#6366f1", // Primary color
            },
            modal: {
              ondismiss: function () {
                setProcessing(false);
                toast.info("Payment cancelled");
              }
            }
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.on('payment.failed', function (response: any) {
            toast.error(`Payment failed: ${response.error.description}`);
            setProcessing(false);
          });
          razorpay.open();
        };

        script.onerror = () => {
          toast.error("Failed to load payment gateway");
          setProcessing(false);
        };
      }
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
      setProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    if (successData?.case?._id) {
      navigate(`/end-user/cases/${successData.case._id}`);
    }
  };

  if (loading || !service) {
    return <LoadingSpinner />;
  }

  const prices = calculatePrices();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/end-user/services/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complete Payment</h1>
          <p className="text-muted-foreground mt-2">Securely enroll in {service.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Mode</CardTitle>
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Mode Toggle */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-accent/50">
                <Checkbox
                  id="test-mode"
                  checked={testMode}
                  onCheckedChange={(checked) => setTestMode(checked as boolean)}
                />
                <label
                  htmlFor="test-mode"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Test Mode (For Demo Purposes)
                </label>
              </div>

              {testMode && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Test Mode Active</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        No real money will be charged. Click "Pay Now" to simulate a successful payment and get enrolled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Information - Only for real payments */}
              {!testMode && (
                <>
                  <div className="pt-2">
                    <h4 className="font-semibold mb-3">Billing Information</h4>
                    <div className="space-y-3">
                      <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={billingInfo.fullName}
                        onChange={(e: any) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        value={billingInfo.email}
                        onChange={(e: any) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        placeholder="+91 9999999999"
                        value={billingInfo.phone}
                        onChange={(e: any) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                      />
                      <Input
                        label="Address"
                        placeholder="123 Main St"
                        value={billingInfo.address}
                        onChange={(e: any) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="City"
                          placeholder="Mumbai"
                          value={billingInfo.city}
                          onChange={(e: any) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                        />
                        <Input
                          label="Postal Code"
                          placeholder="400001"
                          value={billingInfo.postalCode}
                          onChange={(e: any) => setBillingInfo({ ...billingInfo, postalCode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Secure Payment via Razorpay</p>
                      <p className="text-xs text-muted-foreground">Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2 pt-4 border-t">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none cursor-pointer"
                >
                  I agree to the terms and conditions and understand the refund policy
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Info */}
              <div>
                <p className="font-medium">{service.name}</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {service.type.replace("_", " ")}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                {/* Coupon Code Section */}
                <div className="pb-4 border-b">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Have a Coupon Code?
                  </h4>
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
                        onClick={handleValidateCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-mono font-semibold text-green-900 dark:text-green-100">
                            {appliedCoupon.coupon.code}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            {appliedCoupon.coupon.discountPercentage}% off
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-green-700 hover:text-green-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">₹{service.price.toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount ({appliedCoupon.coupon.discountPercentage}%)</span>
                    <span className="font-medium">-₹{prices.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{prices.basePrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-medium">₹{prices.gst.toLocaleString()}</span>
                </div>

                <div className="flex justify-between pt-3 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl text-primary">₹{prices.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={!termsAccepted || processing}
              >
                {processing ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    {testMode ? `Pay ₹${prices.total.toLocaleString()} (Test)` : `Pay ₹${prices.total.toLocaleString()}`}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="h-3 w-3" />
                <span>256-bit SSL encrypted • PCI DSS Compliant</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl text-center">Payment Successful!</DialogTitle>
            <DialogDescription className="text-center">
              You have been successfully enrolled in the service.
            </DialogDescription>
          </DialogHeader>

          {successData && (
            <div className="space-y-4 py-4">
              {/* Case Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Case ID</p>
                    <p className="font-mono font-semibold text-lg">{successData.case.caseId}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{successData.case.status}</Badge>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Service Enrolled</p>
                <p className="font-semibold">{successData.service.name}</p>
                <Badge variant="outline" className="mt-1 capitalize">{successData.service.type.replace("_", " ")}</Badge>
              </div>

              {/* Payment Details */}
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Payment Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-mono">{successData.payment.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs">{successData.payment.transactionId.substring(0, 20)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold text-green-600">₹{successData.payment.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="default" className="bg-green-600">{successData.payment.status}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={handleSuccessClose} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Case Details
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/end-user/payments')}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Payment History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
