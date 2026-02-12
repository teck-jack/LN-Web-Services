import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download, Mail, CheckCircle2 } from "lucide-react";
import { associateService } from "@/services/associateService";
import { toast } from "sonner";

interface ReceiptData {
    receiptNumber: string;
    issueDate: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    service: {
        name: string;
        type: string;
        enrollmentDate: string;
    };
    payment: {
        amount: number;
        method: string;
        transactionId?: string;
        invoiceNumber: string;
        status: string;
        date: string;
    };
}

export default function EnrollmentReceipt() {
    const { caseId } = useParams<{ caseId: string }>();
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState<ReceiptData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (caseId) {
            fetchReceipt();
        }
    }, [caseId]);

    const fetchReceipt = async () => {
        try {
            setLoading(true);
            const response = await associateService.getEnrollmentReceipt(caseId!);
            if (response.success) {
                setReceipt(response.data);
            } else {
                toast.error(response.message || "Failed to fetch receipt");
                navigate("/associate/enrollment-history");
            }
        } catch (error) {
            toast.error("Failed to fetch receipt");
            navigate("/associate/enrollment-history");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        toast.info("PDF download feature coming soon");
    };

    const handleEmail = () => {
        toast.info("Email feature coming soon");
    };

    if (loading || !receipt) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading receipt...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-4 md:p-8">
            {/* Action Buttons - Hidden on print */}
            <div className="max-w-4xl mx-auto mb-4 flex gap-2 print:hidden">
                <Button variant="outline" onClick={() => navigate("/associate/enrollment-history")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                </Button>
                <Button variant="outline" onClick={handleEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                </Button>
            </div>

            {/* Receipt Card */}
            <Card className="max-w-4xl mx-auto shadow-lg print:shadow-none">
                <CardContent className="p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary mb-2">SERVEASSIST PRO</h1>
                        <h2 className="text-xl font-semibold text-muted-foreground">Payment Receipt</h2>
                        <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
                            <div>
                                <span className="font-medium">Receipt #:</span> {receipt.receiptNumber}
                            </div>
                            <div>
                                <span className="font-medium">Date:</span> {receipt.issueDate}
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Customer Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            Customer Details
                        </h3>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="col-span-2 font-medium">{receipt.customer.name}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="col-span-2 font-medium">{receipt.customer.email}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="col-span-2 font-medium">{receipt.customer.phone}</span>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Service Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Service Details</h3>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Service:</span>
                                <span className="col-span-2 font-medium">{receipt.service.name}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Type:</span>
                                <span className="col-span-2 font-medium">{receipt.service.type}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Enrolled:</span>
                                <span className="col-span-2 font-medium">{receipt.service.enrollmentDate}</span>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Payment Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Amount Paid:</span>
                                <span className="col-span-2 font-bold text-xl text-primary">
                                    ₹{receipt.payment.amount.toLocaleString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Payment Method:</span>
                                <span className="col-span-2 font-medium capitalize">{receipt.payment.method}</span>
                            </div>
                            {receipt.payment.transactionId && (
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Transaction ID:</span>
                                    <span className="col-span-2 font-mono text-sm">{receipt.payment.transactionId}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Invoice #:</span>
                                <span className="col-span-2 font-medium">{receipt.payment.invoiceNumber}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Payment Date:</span>
                                <span className="col-span-2 font-medium">{receipt.payment.date}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="col-span-2">
                                    <Badge variant="success" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {receipt.payment.status}
                                    </Badge>
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Footer */}
                    <div className="text-center text-muted-foreground mt-8">
                        <p className="font-medium">Thank you for your business!</p>
                        <p className="text-sm mt-2">
                            For any queries, please contact our support team.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
