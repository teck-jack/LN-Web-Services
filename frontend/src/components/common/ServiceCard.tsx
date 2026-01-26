import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, IndianRupee } from "lucide-react";

interface ServiceCardProps {
  service: {
    _id: string;
    name: string;
    type: string;
    description: string;
    price: number;
    duration: string;
    isActive: boolean;
  };
  onViewDetails: (id: string) => void;
}

export function ServiceCard({ service, onViewDetails }: ServiceCardProps) {
  return (
    <Card className="card-hover h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
            <Badge variant="secondary" className="mb-2">
              {service.type.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span className="font-semibold text-lg">₹{service.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{service.duration}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onViewDetails(service._id)}
          disabled={!service.isActive}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
