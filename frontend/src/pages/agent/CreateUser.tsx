import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/common/Input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { agentService } from "@/services/agentService";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
// import { PaymentDialog } from "@/components/common/PaymentDialog";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  // serviceId: z.string().optional(), // Removed - service enrollment now done from OnboardedUsers
});

// interface Service {
//   _id: string;
//   name: string;
//   type: string;
//   description: string;
//   price: number;
//   duration: string;
// }

export default function CreateUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const [services, setServices] = useState<Service[]>([]); // Removed
  // const [selectedService, setSelectedService] = useState<Service | null>(null); // Removed

  // Payment Dialog State - Removed
  // const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  // const [createdUser, setCreatedUser] = useState<any>(null);
  // const [pendingUserData, setPendingUserData] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      // serviceId: "", // Removed
    },
  });

  // useEffect(() => {
  //   fetchServices();
  // }, []);

  // const fetchServices = async () => {
  //   try {
  //     const response = await agentService.getServices();
  //     setServices(response.data);
  //   } catch (error) {
  //     toast.error("Failed to fetch services");
  //   }
  // };

  // const handleServiceChange = (serviceId: string) => {
  //   const service = services.find(s => s._id === serviceId);
  //   setSelectedService(service || null);
  // };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      };

      // Create user immediately (service enrollment now done from OnboardedUsers)
      const response = await agentService.createEndUser(userData);

      toast.success("User created successfully!");
      navigate("/agent/users");

    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // const handlePaymentSuccess = (data: { case: any; payment: any }) => {
  //   toast.success(`${createdUser?.name || pendingUserData?.name || 'User'} enrolled successfully!`);
  //   setPaymentDialogOpen(false);
  //   navigate("/agent/users");
  // };

  // const handlePaymentCancel = () => {
  //   toast.info("User created but not enrolled in service.");
  //   navigate("/agent/users");
  // };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/agent/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create End User</h1>
          <p className="text-muted-foreground mt-2">Onboard a new user to the platform</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Enter the details of the new user</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Service Selection - Removed (enrollment now done from OnboardedUsers)
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enroll in Service (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleServiceChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service to enroll" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service._id} value={service._id}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{service.name}</span>
                                <Badge variant="secondary">₹{service.price.toLocaleString()}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                */}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/agent/users")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Service Details Sidebar - Removed (enrollment now done from OnboardedUsers)
        <div className="space-y-6">
          {selectedService ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Selected Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedService.name}</h3>
                  <Badge variant="outline" className="mt-1 capitalize">{selectedService.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-semibold">₹{selectedService.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{selectedService.duration}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a service to see details and enable payment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        */}
      </div>

      {/* Payment Dialog - Removed (enrollment now done from OnboardedUsers)
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        service={selectedService}
        endUserId={createdUser?._id || ""}
        endUserName={createdUser?.name || pendingUserData?.name}
        endUserEmail={createdUser?.email || pendingUserData?.email}
        endUserPhone={createdUser?.phone || pendingUserData?.phone}
        newUserData={!createdUser ? pendingUserData : undefined}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
      */}
    </div>
  );
}
