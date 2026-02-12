import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, User, CreditCard, Calendar, FileText } from "lucide-react";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [paymentDetails, setPaymentDetails] = useState<any>(null);

    useEffect(() => {
        // Extract payment details from URL params
        const details = {
            userName: searchParams.get("userName") || "User",
            userEmail: searchParams.get("userEmail") || "",
            userId: searchParams.get("userId") || "",
            serviceName: searchParams.get("serviceName") || "Service",
            amount: searchParams.get("amount") || "0",
            paymentId: searchParams.get("paymentId") || "",
            caseId: searchParams.get("caseId") || "",
        };
        setPaymentDetails(details);
    }, [searchParams]);

    if (!paymentDetails) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl text-green-600 dark:text-green-400">Payment Successful!</CardTitle>
                    <CardDescription className="text-base">
                        User has been successfully enrolled in the service
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* User Details */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">User Enrolled</p>
                                <p className="font-semibold">{paymentDetails.userName}</p>
                                {paymentDetails.userEmail && (
                                    <p className="text-sm text-muted-foreground">{paymentDetails.userEmail}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service & Payment Details */}
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Service</p>
                                    <p className="font-semibold">{paymentDetails.serviceName}</p>
                                </div>
                            </div>
                            <Badge variant="success">Active</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                                    <p className="font-semibold text-lg">₹{parseInt(paymentDetails.amount).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {paymentDetails.paymentId && (
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Payment ID</p>
                                    <p className="font-mono text-sm">{paymentDetails.paymentId}</p>
                                </div>
                            </div>
                        )}

                        {paymentDetails.caseId && (
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Case ID</p>
                                    <p className="font-mono text-sm">{paymentDetails.caseId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                // If userId exists, go back to enrollment page
                                if (paymentDetails.userId) {
                                    navigate(`/agent/enroll/${paymentDetails.userId}?paymentSuccess=true`);
                                } else {
                                    navigate("/agent/users");
                                }
                            }}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {paymentDetails.userId ? "Back to Enrollment" : "Back to Users"}
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => navigate("/agent/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
