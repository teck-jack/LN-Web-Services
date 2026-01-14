import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Calendar, User } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  sourceTag?: string;
  isActive: boolean;
  createdAt: string;
  cases?: Array<{
    _id: string;
    caseId: string;
    status: string;
    serviceId: {
      name: string;
      type: string;
    };
  }>;
}

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserDetails(id);
    }
  }, [id]);

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoading(true);
      const response = await adminService.getUser(userId);
      setUser(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch user details");
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/associate/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground mt-2">View user information and cases</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Basic details about the user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Badge variant={user.isActive ? "success" : "destructive"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {user.sourceTag && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Source</p>
                  <Badge variant="outline" className="capitalize">
                    {user.sourceTag.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cases</CardTitle>
              <CardDescription>List of cases associated with this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.cases && user.cases.length > 0 ? (
                <div className="space-y-4">
                  {user.cases.map((caseItem) => (
                    <div
                      key={caseItem._id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{caseItem.caseId}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {caseItem.serviceId.name}
                          </p>
                          <Badge variant="outline" className="mt-2 capitalize">
                            {caseItem.serviceId.type}
                          </Badge>
                        </div>
                        <Badge variant={
                          caseItem.status === 'completed' ? 'success' :
                            caseItem.status === 'in_progress' ? 'default' :
                              caseItem.status === 'cancelled' ? 'destructive' :
                                'secondary'
                        } className="capitalize">
                          {caseItem.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No cases found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
