import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/ui/badge";
import { agentService } from "@/services/agentService";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface Service {
  _id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
}

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchQuery, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await agentService.getServices();
      setServices(response.data);
      setFilteredServices(response.data);
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground mt-2">Browse available services for user onboarding</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service._id} className="card-hover">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{service.name}</CardTitle>
                  <Badge variant="secondary">{service.type}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">₹{service.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{service.duration}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/agent/services/${service._id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services found</p>
        </div>
      )}
    </div>
  );
}
