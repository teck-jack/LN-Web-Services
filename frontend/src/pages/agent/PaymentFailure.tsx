import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";

export default function PaymentFailure() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [failureDetails, setFailureDetails] = useState<any>(null);

    useEffect(() => {
        // Extract failure details from URL params
        const details = {
            userName: searchParams.get("userName") || "User",
            userId: searchParams.get("userId") || "",
            serviceName: searchParams.get("serviceName") || "Service",
            amount: searchParams.get("amount") || "0",
            error: searchParams.get("error") || "Payment failed",
            reason: searchParams.get("reason") || "",
        };
        setFailureDetails(details);
    }, [searchParams]);

    if (!failureDetails) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400">Payment Failed</CardTitle>
                    <CardDescription className="text-base">
                        The payment could not be processed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Error Alert */}
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="ml-2">
                            {failureDetails.error}
                        </AlertDescription>
                    </Alert>

                    {/* Failure Details */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="grid gap-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">User:</span>
                                <span className="font-medium">{failureDetails.userName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Service:</span>
                                <span className="font-medium">{failureDetails.serviceName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Amount:</span>
                                <span className="font-medium">₹{parseInt(failureDetails.amount).toLocaleString()}</span>
                            </div>
                            {failureDetails.reason && (
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-sm text-muted-foreground">Reason:</span>
                                    <span className="font-medium text-sm">{failureDetails.reason}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Help Information */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            What to do next?
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                            <li>Check if you have sufficient balance in your payment method</li>
                            <li>Verify your payment details are correct</li>
                            <li>Try using a different payment method</li>
                            <li>Contact support if the issue persists</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                if (failureDetails.userId) {
                                    navigate(`/agent/enroll/${failureDetails.userId}`);
                                } else {
                                    navigate("/agent/users");
                                }
                            }}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {failureDetails.userId ? "Back to Enrollment" : "Back to Users"}
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={() => {
                                if (failureDetails.userId) {
                                    navigate(`/agent/enroll/${failureDetails.userId}`);
                                } else {
                                    navigate("/agent/users");
                                }
                            }}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
