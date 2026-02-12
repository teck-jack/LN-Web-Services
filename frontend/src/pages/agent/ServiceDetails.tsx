import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/common/Timeline";
import { agentService } from "@/services/agentService";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface Service {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
  documentsRequired: string[];
  processSteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
  }>;
}

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchService(id);
    }
  }, [id]);

  const fetchService = async (serviceId: string) => {
    try {
      setLoading(true);
      const response = await agentService.getService(serviceId);
      setService(response.data);
    } catch (error) {
      toast.error("Failed to fetch service details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Service not found</p>
      </div>
    );
  }

  const timelineSteps = service.processSteps.map((step) => ({
    ...step,
    status: "upcoming" as const,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/agent/services")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
          <p className="text-muted-foreground mt-2">Service details and process steps</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Service Information</CardTitle>
                  <CardDescription>Details about this service</CardDescription>
                </div>
                <Badge variant={service.isActive ? "success" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Type</h4>
                  <Badge variant="secondary">{service.type}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Price</h4>
                  <p className="text-lg font-bold">₹{service.price.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Duration</h4>
                  <p className="text-muted-foreground">{service.duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process Steps</CardTitle>
              <CardDescription>Timeline of the service process</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline steps={timelineSteps} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Documents needed for this service</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {service.documentsRequired.map((doc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate(`/agent/users`)}
          >
            Onboard User with this Service
          </Button>
        </div>
      </div>
    </div>
  );
}
