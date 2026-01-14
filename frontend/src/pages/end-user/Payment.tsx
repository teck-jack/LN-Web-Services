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
import { ArrowLeft, CreditCard, Shield, CheckCircle2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import * as endUserService from "@/services/endUserService";
import { couponService } from "@/services/couponService";

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { service, loading } = useAppSelector((state) => state.endUser);
  const [processing, setProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getService(id));
    }
    return () => {
      dispatch(clearService());
    };
  }, [dispatch, id]);

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

  const handlePayment = async () => {
    if (!service || !termsAccepted) {
      toast.error("Please accept terms and conditions");
      return;
    }

    try {
      setProcessing(true);

      if (testMode) {
        // Test payment - verify with backend
        const orderResponse = await endUserService.createPaymentOrder(
          service._id,
          true,
          appliedCoupon?.coupon?.code
        );
        const { order, discount, coupon } = orderResponse.data.data;

        // Verify payment
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
          const caseId = verifyResponse.data.data.case._id;
          toast.success("Test payment successful! Case created.");
          navigate(`/end-user/cases/${caseId}`);
        }
      } else {
        // Real Razorpay integration
        const orderResponse = await endUserService.createPaymentOrder(
          service._id,
          false,
          appliedCoupon?.coupon?.code
        );
        const { order, discount, coupon } = orderResponse.data.data;

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: "rzp_test_YOUR_KEY_HERE", // Replace with your Razorpay key
            amount: order.amount,
            currency: order.currency,
            name: "IP Services",
            description: service.name,
            order_id: order.id,
            handler: async function (response: any) {
              try {
                const verifyResponse = await endUserService.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  serviceId: service._id,
                  couponCode: coupon?.code,
                  couponId: coupon?.id,
                  discountInfo: discount
                });

                if (verifyResponse.data.success) {
                  const caseId = verifyResponse.data.data.case._id;
                  toast.success("Payment successful! Case created.");
                  navigate(`/end-user/cases/${caseId}`);
                }
              } catch (error: any) {
                toast.error(error.message || "Payment verification failed");
              }
            },
            prefill: {
              name: "User Name",
              email: "user@example.com",
              contact: "9999999999",
            },
            theme: {
              color: "#3b82f6",
            },
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
          setProcessing(false);
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

  if (loading || !service) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/end-user/services/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
          <p className="text-muted-foreground mt-2">Complete your purchase securely</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Mode</CardTitle>
              <CardDescription>Choose your payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-accent/50">
                <Checkbox
                  id="test-mode"
                  checked={testMode}
                  onCheckedChange={(checked) => setTestMode(checked as boolean)}
                />
                <label
                  htmlFor="test-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                        This is a test payment. No real money will be charged. Click "Pay Now" to simulate a successful payment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!testMode && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3">Billing Information</h4>
                    <div className="space-y-3">
                      <Input label="Full Name" placeholder="John Doe" />
                      <Input label="Email" type="email" placeholder="john@example.com" />
                      <Input label="Phone" type="tel" placeholder="+91 9999999999" />
                      <Input label="Address" placeholder="123 Main St" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="City" placeholder="Mumbai" />
                        <Input label="Postal Code" placeholder="400001" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Secure Payment</p>
                      <p className="text-xs text-muted-foreground">Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions and understand the refund policy
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{service.name}</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {service.type.replace("_", " ")}
                </Badge>
              </div>

              <div className="space-y-2 pt-4 border-t">
                {/* Coupon Code Section */}
                <div className="pb-4 border-b">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Have a Coupon Code?
                  </h4>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
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
                        {validatingCoupon ? "Validating..." : "Apply"}
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
                            {appliedCoupon.coupon.discountPercentage}% discount applied
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
                    <span className="font-medium">
                      -₹{appliedCoupon.discount.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ₹{(appliedCoupon ? appliedCoupon.discount.finalAmount : service.price).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-medium">
                    ₹{Math.round((appliedCoupon ? appliedCoupon.discount.finalAmount : service.price) * 0.18).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">
                    ₹{Math.round((appliedCoupon ? appliedCoupon.discount.finalAmount : service.price) * 1.18).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={!termsAccepted || processing}
              >
                {processing ? (
                  <>
                    <LoadingSpinner />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    {testMode ? "Pay Now (Test)" : "Pay Now"}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="h-3 w-3" />
                <span>256-bit SSL encrypted payment</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
