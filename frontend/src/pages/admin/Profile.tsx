import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export default function AdminProfile() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">No user data available</p>
            </div>
        );
    }

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your account information and settings</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Your account details and contact information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-2xl font-semibold">{user.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="capitalize">{user.role.replace("_", " ")}</Badge>
                                    <Badge variant="success">Active</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            {user.phone && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                                    </div>
                                </div>
                            )}



                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Role</p>
                                    <p className="text-sm text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
