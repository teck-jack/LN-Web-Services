import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getService, clearService } from "@/store/slices/endUserSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Timeline } from "@/components/common/Timeline";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Clock, IndianRupee, FileText, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { service, loading } = useAppSelector((state) => state.endUser);

  useEffect(() => {
    if (id) {
      dispatch(getService(id));
    }
    return () => {
      dispatch(clearService());
    };
  }, [dispatch, id]);

  const handlePurchase = () => {
    if (!service) return;
    // Navigate to payment page
    navigate(`/end-user/payment/${service._id}`);
  };

  if (loading || !service) {
    return <LoadingSpinner />;
  }

  const timelineSteps = (service.processSteps || []).map((step) => ({
    ...step,
    status: "upcoming" as const,
  }));

  const faqs = [
    {
      question: "What documents are required?",
      answer: (service.documentsRequired || []).join(", ") || "None specified",
    },
    {
      question: "How long does the process take?",
      answer: `The entire process typically takes ${service.duration}.`,
    },
    {
      question: "What is included in the service?",
      answer: "This service includes all the necessary steps to complete your registration with full support from our team.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/end-user/services")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
              <Badge variant="secondary" className="mt-2">
                {service.type?.replace("_", " ") || "N/A"}
              </Badge>
            </div>
            <Button onClick={handlePurchase} size="lg" className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase for ₹{(service.price || 0).toLocaleString()}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{service.description}</p>
              <div className="grid gap-4 mt-6 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold">₹{service.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{service.duration}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process Steps</CardTitle>
              <CardDescription>How we'll help you complete this service</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline steps={timelineSteps} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>You'll need these documents to proceed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(service.documentsRequired || []).map((doc, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>Purchase this service and we'll guide you through every step</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handlePurchase} className="w-full" size="lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Purchase Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
