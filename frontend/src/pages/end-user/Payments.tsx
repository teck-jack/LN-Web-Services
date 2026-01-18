import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getPayments } from "@/store/slices/endUserSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";
import { Search, Filter, Download, DollarSign, CreditCard, Calendar, Printer, X, FileText } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { getPaymentReceipt } from "@/services/endUserService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusColors = {
  completed: "success",
  pending: "default",
  failed: "destructive",
  refunded: "secondary",
} as const;

interface ReceiptData {
  invoiceNumber: string;
  paymentDate: string;
  transactionId: string;
  paymentMethod: string;
  status: string;
  originalAmount: number;
  discountAmount: number;
  discountPercentage: number;
  couponCode: string | null;
  finalAmount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  service: {
    name: string;
    type: string;
    description: string;
    price: number;
    duration: string;
  };
  caseInfo: {
    caseId: string;
    createdAt: string;
  };
  company: {
    name: string;
    tagline: string;
    address: string;
    email: string;
    phone: string;
    website: string;
  };
}

export default function Payments() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { payments, loading, pagination } = useAppSelector((state) => state.endUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(getPayments({ page, limit }));
  }, [dispatch, page, limit]);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.caseId?.caseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.caseId?.serviceId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const completedPayments = payments.filter((p) => p.status === "completed").length;
  const lastPayment = payments.length > 0 ? payments[0] : null;

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      setLoadingReceipt(true);
      const response = await getPaymentReceipt(paymentId);
      setReceiptData(response.data.data);
      setReceiptDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load receipt");
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print receipt");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${receiptData?.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #fff; }
          .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #1a1a2e; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 24px; text-align: center; }
          .header h1 { font-size: 24px; margin-bottom: 4px; }
          .header p { opacity: 0.9; font-size: 14px; }
          .invoice-info { background: #f8f9fa; padding: 16px 24px; display: flex; justify-content: space-between; border-bottom: 1px solid #e9ecef; }
          .invoice-info div { text-align: center; }
          .invoice-info .label { font-size: 12px; color: #6c757d; text-transform: uppercase; }
          .invoice-info .value { font-size: 14px; font-weight: 600; color: #1a1a2e; }
          .section { padding: 20px 24px; border-bottom: 1px solid #e9ecef; }
          .section-title { font-size: 12px; text-transform: uppercase; color: #6c757d; margin-bottom: 12px; letter-spacing: 1px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .detail-row .label { color: #6c757d; }
          .detail-row .value { font-weight: 500; color: #1a1a2e; }
          .amount-section { background: #f8f9fa; }
          .total-row { font-size: 18px; font-weight: 700; color: #1a1a2e; padding-top: 12px; margin-top: 12px; border-top: 2px dashed #dee2e6; }
          .total-row .value { color: #28a745; }
          .discount { color: #28a745 !important; }
          .footer { background: #1a1a2e; color: white; padding: 20px 24px; text-align: center; }
          .footer p { font-size: 12px; opacity: 0.9; margin-bottom: 4px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-completed { background: #d4edda; color: #155724; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-failed { background: #f8d7da; color: #721c24; }
          @media print { body { padding: 0; } .receipt { border: none; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const columns = [
    {
      header: "Invoice",
      accessor: "invoiceNumber" as any,
      cell: (row: any) => (
        <div>
          <span className="font-medium text-primary">{row.invoiceNumber || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: "Service",
      accessor: (row: any) => row.caseId?.serviceId?.name || 'N/A',
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.caseId?.serviceId?.name || 'N/A'}</p>
          <p className="text-xs text-muted-foreground capitalize">{row.caseId?.serviceId?.type || ''}</p>
        </div>
      ),
    },
    {
      header: "Case ID",
      accessor: (row: any) => row.caseId?.caseId,
      cell: (row: any) => (
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => navigate(`/end-user/cases/${row.caseId?._id}`)}
        >
          {row.caseId?.caseId}
        </Button>
      ),
    },
    {
      header: "Discount",
      accessor: (row: any) => row.discountAmount || 0,
      cell: (row: any) => (
        row.discountAmount > 0 ? (
          <div className="text-sm">
            <p className="font-medium text-green-600">-₹{row.discountAmount.toLocaleString()}</p>
            {row.couponCode && (
              <p className="text-xs text-muted-foreground font-mono">{row.couponCode}</p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      header: "Amount",
      accessor: "amount" as any,
      cell: (row: any) => (
        <div className="text-sm">
          {row.originalAmount && row.originalAmount !== row.amount && (
            <p className="text-xs text-muted-foreground line-through">
              ₹{row.originalAmount.toLocaleString()}
            </p>
          )}
          <span className="font-semibold">₹{row.amount.toLocaleString()}</span>
        </div>
      ),
    },
    {
      header: "Method",
      accessor: "paymentMethod" as any,
      cell: (row: any) => {
        const methodLabels: Record<string, { label: string; variant: string }> = {
          'razorpay': { label: 'Online (Razorpay)', variant: 'default' },
          'test_payment': { label: 'Test Mode', variant: 'secondary' },
          'agent_onboarding': { label: 'Agent', variant: 'outline' },
          'associate_onboarding': { label: 'Associate', variant: 'outline' },
          'admin_enrollment': { label: 'Admin', variant: 'outline' },
          'employee_enrollment': { label: 'Employee', variant: 'outline' },
          'manual_enrollment': { label: 'Manual', variant: 'secondary' },
        };
        const method = methodLabels[row.paymentMethod] || { label: row.paymentMethod, variant: 'outline' };
        return (
          <Badge variant={method.variant as any} className="capitalize whitespace-nowrap">
            {method.label}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      accessor: "status" as any,
      cell: (row: any) => (
        <Badge variant={statusColors[row.status as keyof typeof statusColors]}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Date",
      accessor: "paymentDate" as any,
      cell: (row: any) => (
        <div>
          <p className="font-medium">{format(new Date(row.paymentDate), "MMM dd, yyyy")}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(row.paymentDate), { addSuffix: true })}
          </p>
        </div>
      ),
    },
    {
      header: "Receipt",
      accessor: "_id" as any,
      cell: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadReceipt(row._id)}
          disabled={loadingReceipt}
        >
          <Download className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Receipt</span>
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-2">View all your transactions and download receipts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Amount Paid</CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <Calendar className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastPayment
                ? formatDistanceToNow(new Date(lastPayment.paymentDate), { addSuffix: true })
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID, case ID, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        pagination={{
          page: pagination.payments.page,
          limit: pagination.payments.limit,
          total: pagination.payments.total,
        }}
        onPageChange={setPage}
      />

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No payments found</p>
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Receipt</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrintReceipt}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {receiptData && (
            <div ref={receiptRef} className="receipt">
              {/* Header */}
              <div className="header" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white', padding: '24px', textAlign: 'center', borderRadius: '12px 12px 0 0' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: 'bold' }}>{receiptData.company.name}</h1>
                <p style={{ opacity: 0.9, fontSize: '14px' }}>{receiptData.company.tagline}</p>
              </div>

              {/* Invoice Info Bar */}
              <div style={{ background: '#f8f9fa', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e9ecef' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase' }}>Invoice No</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{receiptData.invoiceNumber}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase' }}>Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{format(new Date(receiptData.paymentDate), 'MMM dd, yyyy')}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase' }}>Status</div>
                  <Badge variant={statusColors[receiptData.status as keyof typeof statusColors]} className="mt-1">
                    {receiptData.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Customer Details */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c757d', marginBottom: '12px', letterSpacing: '1px' }}>Customer Details</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Name</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{receiptData.customer.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Email</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{receiptData.customer.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Phone</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{receiptData.customer.phone}</span>
                </div>
              </div>

              {/* Service Details */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c757d', marginBottom: '12px', letterSpacing: '1px' }}>Service Details</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Service</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{receiptData.service.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Type</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e', textTransform: 'capitalize' }}>{receiptData.service.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Duration</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{receiptData.service.duration}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Case ID</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{receiptData.caseInfo.caseId}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div style={{ padding: '20px 24px', background: '#f8f9fa' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c757d', marginBottom: '12px', letterSpacing: '1px' }}>Payment Details</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Original Amount</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e' }}>₹{receiptData.originalAmount.toLocaleString()}</span>
                </div>
                {receiptData.discountAmount > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ color: '#6c757d' }}>Discount {receiptData.couponCode && `(${receiptData.couponCode})`}</span>
                      <span style={{ fontWeight: 500, color: '#28a745' }}>-₹{receiptData.discountAmount.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Payment Method</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e', textTransform: 'capitalize' }}>{receiptData.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6c757d' }}>Transaction ID</span>
                  <span style={{ fontWeight: 500, color: '#1a1a2e', fontSize: '12px' }}>{receiptData.transactionId}</span>
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, paddingTop: '12px', marginTop: '12px', borderTop: '2px dashed #dee2e6' }}>
                  <span style={{ color: '#1a1a2e' }}>Total Paid</span>
                  <span style={{ color: '#28a745' }}>₹{receiptData.finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: '#1a1a2e', color: 'white', padding: '20px 24px', textAlign: 'center', borderRadius: '0 0 12px 12px' }}>
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>Thank you for choosing {receiptData.company.name}!</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>{receiptData.company.email} | {receiptData.company.website}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
